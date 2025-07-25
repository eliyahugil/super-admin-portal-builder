import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';
import { Building, Clock, Settings, Upload } from 'lucide-react';

interface BusinessDetails {
  id: string;
  name: string;
  contact_phone?: string;
  address?: string;
  logo_url?: string;
  contact_email?: string;
  admin_email?: string;
  description?: string;
  allow_employee_reporting_web?: boolean;
  require_employee_gps?: boolean;
  require_employee_image?: boolean;
  allow_shift_editing?: boolean;
  allow_past_shift_editing?: boolean;
  allow_shift_submission_without_token?: boolean;
}

interface ModuleConfig {
  module_key: string;
  is_enabled: boolean;
}

interface ScheduleConfig {
  send_day: string;
  send_time: string;
  channel_type: string;
  is_active: boolean;
}

export const BusinessSettingsMain: React.FC = () => {
  const { businessId: urlBusinessId } = useParams();
  const { business, businessId: hookBusinessId } = useBusiness();
  const { toast } = useToast();
  
  // Use businessId from URL if available, otherwise from hook
  const effectiveBusinessId = urlBusinessId || hookBusinessId;
  
  const [details, setDetails] = useState<BusinessDetails>({
    id: '',
    name: '',
    contact_phone: '',
    address: '',
    logo_url: '',
    contact_email: '',
    admin_email: '',
    description: '',
    allow_employee_reporting_web: false,
    require_employee_gps: false,
    require_employee_image: false,
    allow_shift_editing: false,
    allow_past_shift_editing: false,
    allow_shift_submission_without_token: false
  });
  const [modules, setModules] = useState<ModuleConfig[]>([]);
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    send_day: 'Thursday',
    send_time: '09:00',
    channel_type: 'whatsapp',
    is_active: true
  });
  const [loading, setLoading] = useState(true);

  // ... keep existing code (allModules array definition)
  const allModules = [
    { key: 'shift_management', label: 'ניהול משמרות' },
    { key: 'employee_documents', label: 'מסמכי עובדים' },
    { key: 'employee_notes', label: 'הערות עובדים' },
    { key: 'salary_management', label: 'ניהול שכר' },
    { key: 'employee_contacts', label: 'תקשורת עובדים' },
    { key: 'branch_management', label: 'ניהול סניפים' },
    { key: 'employee_attendance', label: 'נוכחות עובדים' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!effectiveBusinessId) {
        console.log('No business ID available');
        setLoading(false);
        return;
      }

      console.log('Fetching business data for ID:', effectiveBusinessId);

      try {
        // Fetch business details
        const { data: bizData, error: bizError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', effectiveBusinessId)
          .single();

        if (bizError) {
          console.error('Error fetching business:', bizError);
          throw bizError;
        }
        
        console.log('Business data fetched:', bizData);
        if (bizData) setDetails(bizData);

        // Fetch module configuration
        const { data: moduleData, error: moduleError } = await supabase
          .from('business_module_config')
          .select('module_key, is_enabled')
          .eq('business_id', effectiveBusinessId);

        if (moduleError) {
          console.error('Error fetching modules:', moduleError);
          throw moduleError;
        }
        setModules(moduleData || []);

        // Schedule configuration removed - token system no longer exists
        console.log('Schedule configuration removed due to token system removal');
      } catch (error) {
        console.error('Error fetching business settings:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את הגדרות העסק',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [effectiveBusinessId, toast]);

  // FIX: Accept string | boolean for value param
  const updateBusinessField = async (field: keyof BusinessDetails, value: string | boolean) => {
    if (!effectiveBusinessId) return;

    try {
      const { error } = await supabase
        .from('businesses')
        .update({ [field]: value })
        .eq('id', effectiveBusinessId);

      if (error) throw error;

      setDetails(prev => ({ ...prev, [field]: value }));
      
      toast({
        title: 'עודכן בהצלחה',
        description: 'פרטי העסק נשמרו',
      });
    } catch (error) {
      console.error('Error updating business field:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את פרטי העסק',
        variant: 'destructive',
      });
    }
  };

  const toggleModule = async (moduleKey: string, currentValue: boolean) => {
    if (!effectiveBusinessId) return;

    try {
      const { error } = await supabase
        .from('business_module_config')
        .upsert({
          business_id: effectiveBusinessId,
          module_key: moduleKey,
          is_enabled: !currentValue,
          enabled_by: (await supabase.auth.getUser()).data.user?.id,
          enabled_at: !currentValue ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'business_id,module_key' 
        });

      if (error) throw error;

      setModules(prev => {
        const existing = prev.find(m => m.module_key === moduleKey);
        if (existing) {
          return prev.map(m => 
            m.module_key === moduleKey 
              ? { ...m, is_enabled: !currentValue }
              : m
          );
        } else {
          return [...prev, { module_key: moduleKey, is_enabled: !currentValue }];
        }
      });

      toast({
        title: 'עודכן בהצלחה',
        description: `המודול ${!currentValue ? 'הופעל' : 'הושבת'}`,
      });
    } catch (error) {
      console.error('Error toggling module:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את המודול',
        variant: 'destructive',
      });
    }
  };

  // Schedule update removed - token system no longer exists

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6" dir="rtl">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  if (!effectiveBusinessId) {
    return (
      <div className="max-w-4xl mx-auto p-6" dir="rtl">
        <div className="text-center text-red-600">לא נמצא מזהה עסק</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          הגדרות עסק
        </h1>
        <p className="text-gray-600 mt-2">נהל את פרטי העסק, מודולים ותזמונים</p>
        {effectiveBusinessId && (
          <p className="text-sm text-gray-500 mt-1">מזהה עסק: {effectiveBusinessId}</p>
        )}
      </div>
      
      {/* General Employee Settings Card: FIXED SWITCH HANDLERS */}
      <Card>
        <CardHeader>
          <CardTitle>הגדרות כלליות לעובדים</CardTitle>
          <CardDescription>
            קבע את התנהגות דיווח המשמרות לעובדים והרשאות כלליות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b py-2">
              <div>
                <div className="font-medium">אפשר דיווח משמרות גם מאתר</div>
                <div className="text-sm text-gray-500">אם כבוי, ניתן לדווח רק מהאפליקציה.</div>
              </div>
              <Switch
                checked={!!details.allow_employee_reporting_web}
                onCheckedChange={(val: boolean) => updateBusinessField('allow_employee_reporting_web', val)}
              />
            </div>
            <div className="flex items-center justify-between border-b py-2">
              <div>
                <div className="font-medium">חייב צילום GPS בדיווח</div>
                <div className="text-sm text-gray-500">האם לחייב אימות מיקום בדיווח משמרת?</div>
              </div>
              <Switch
                checked={!!details.require_employee_gps}
                onCheckedChange={(val: boolean) => updateBusinessField('require_employee_gps', val)}
              />
            </div>
            <div className="flex items-center justify-between border-b py-2">
              <div>
                <div className="font-medium">חייב צילום תמונה בעת דיווח</div>
                <div className="text-sm text-gray-500">חובת צילום תמונה בעת כניסה/יציאה ממשמרת</div>
              </div>
              <Switch
                checked={!!details.require_employee_image}
                onCheckedChange={(val: boolean) => updateBusinessField('require_employee_image', val)}
              />
            </div>
            <div className="flex items-center justify-between border-b py-2">
              <div>
                <div className="font-medium">אפשר עריכת משמרות</div>
                <div className="text-sm text-gray-500">האם לאפשר לעובדים לערוך משמרות לאחר השליחה</div>
              </div>
              <Switch
                checked={!!details.allow_shift_editing}
                onCheckedChange={(val: boolean) => updateBusinessField('allow_shift_editing', val)}
              />
            </div>
            <div className="flex items-center justify-between border-b py-2">
              <div>
                <div className="font-medium">אפשר עריכת משמרות בדיעבד</div>
                <div className="text-sm text-gray-500">האם לאפשר עריכה של משמרות לאחר הזמן שהיו אמורות להסתיים</div>
              </div>
              <Switch
                checked={!!details.allow_past_shift_editing}
                onCheckedChange={(val: boolean) => updateBusinessField('allow_past_shift_editing', val)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">אפשר שליחת משמרות ללא טוקן</div>
                <div className="text-sm text-gray-500">האם לאפשר דיווח גם אם לא נדרש טוקן?</div>
              </div>
              <Switch
                checked={!!details.allow_shift_submission_without_token}
                onCheckedChange={(val: boolean) => updateBusinessField('allow_shift_submission_without_token', val)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            פרטי עסק
          </CardTitle>
          <CardDescription>עדכן את המידע הבסיסי של העסק</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">שם העסק</Label>
              <Input
                id="business-name"
                value={details.name}
                onChange={(e) => setDetails(prev => ({ ...prev, name: e.target.value }))}
                onBlur={(e) => updateBusinessField('name', e.target.value)}
                placeholder="שם העסק"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-phone">טלפון</Label>
              <Input
                id="business-phone"
                value={details.contact_phone || ''}
                onChange={(e) => setDetails(prev => ({ ...prev, contact_phone: e.target.value }))}
                onBlur={(e) => updateBusinessField('contact_phone', e.target.value)}
                placeholder="טלפון העסק"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="business-address">כתובת</Label>
            <Input
              id="business-address"
              value={details.address || ''}
              onChange={(e) => setDetails(prev => ({ ...prev, address: e.target.value }))}
              onBlur={(e) => updateBusinessField('address', e.target.value)}
              placeholder="כתובת העסק"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-email">אימייל ליצירת קשר</Label>
            <Input
              id="business-email"
              type="email"
              value={details.contact_email || ''}
              onChange={(e) => setDetails(prev => ({ ...prev, contact_email: e.target.value }))}
              onBlur={(e) => updateBusinessField('contact_email', e.target.value)}
              placeholder="email@business.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email">אימייל מנהל העסק</Label>
            <Input
              id="admin-email"
              type="email"
              value={details.admin_email || ''}
              onChange={(e) => setDetails(prev => ({ ...prev, admin_email: e.target.value }))}
              onBlur={(e) => updateBusinessField('admin_email', e.target.value)}
              placeholder="admin@business.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Modules Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>מודולים פעילים</CardTitle>
          <CardDescription>בחר אילו מודולים יהיו זמינים בעסק שלך</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allModules.map((module) => {
              const moduleConfig = modules.find(m => m.module_key === module.key);
              const isEnabled = moduleConfig?.is_enabled || false;
              
              return (
                <div key={module.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{module.label}</span>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => toggleModule(module.key, isEnabled)}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Configuration Card - Removed due to token system removal */}
    </div>
  );
};

export default BusinessSettingsMain;
