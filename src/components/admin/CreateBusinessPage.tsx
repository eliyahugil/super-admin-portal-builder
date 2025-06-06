import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Building, Mail, Phone, User } from 'lucide-react';

const availableModules = [
  { key: 'shift_management', label: 'ניהול משמרות' },
  { key: 'employee_documents', label: 'מסמכי עובדים' },
  { key: 'employee_notes', label: 'הערות עובדים' },
  { key: 'salary_management', label: 'ניהול שכר' },
  { key: 'employee_contacts', label: 'תקשורת עם עובדים' },
  { key: 'branch_management', label: 'ניהול סניפים' },
  { key: 'employee_attendance', label: 'נוכחות עובדים' },
];

export const CreateBusinessPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    description: '',
    address: '',
  });
  const [activeModules, setActiveModules] = useState<string[]>(['shift_management']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleModule = (moduleKey: string) => {
    setActiveModules(prev => 
      prev.includes(moduleKey)
        ? prev.filter(key => key !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const handleCreateBusiness = async () => {
    if (!formData.name || !formData.contact_email) {
      toast({
        title: 'שגיאה',
        description: 'נא למלא את כל השדות החובה',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create the business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: formData.name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          description: formData.description,
          address: formData.address,
          is_active: true,
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;

      // Enable selected modules for the business
      if (activeModules.length > 0) {
        const moduleInserts = activeModules.map(moduleKey => ({
          business_id: business.id,
          module_key: moduleKey,
          is_enabled: true,
          enabled_by: currentUserId,
          enabled_at: new Date().toISOString(),
        }));

        const { error: moduleError } = await supabase
          .from('business_module_config')
          .insert(moduleInserts);

        if (moduleError) {
          console.warn('Warning: Failed to enable some modules:', moduleError);
        }
      }

      toast({
        title: 'הצלחה!',
        description: `העסק "${business.name}" נוצר בהצלחה`,
      });

      // Navigate back to admin dashboard
      navigate('/admin');
    } catch (error) {
      console.error('Error creating business:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן ליצור את העסק. נסה שוב.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir="rtl">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin')}
          className="mb-4"
        >
          ← חזור לדשבורד סופר אדמין
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Building className="h-8 w-8" />
          יצירת עסק חדש
        </h1>
        <p className="text-gray-600 mt-2">הוסף עסק חדש למערכת והגדר את המודולים הפעילים</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              פרטי העסק
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם העסק *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="הכנס שם עסק"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">מייל ליצירת קשר *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="email@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">טלפון</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="050-1234567"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">כתובת</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="כתובת העסק"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="תיאור קצר של העסק"
                className="text-right"
              />
            </div>
          </CardContent>
        </Card>

        {/* Modules Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>מודולים פעילים</CardTitle>
            <p className="text-sm text-gray-600">בחר אילו מודולים יהיו זמינים לעסק</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableModules.map((module) => (
                <div key={module.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={activeModules.includes(module.key)}
                      onCheckedChange={() => toggleModule(module.key)}
                    />
                    <span className="font-medium">{module.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>נבחרו {activeModules.length} מודולים</strong>
                <br />
                ניתן לשנות את המודולים הפעילים בכל עת מהגדרות העסק
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => navigate('/admin')}>
          ביטול
        </Button>
        <Button 
          onClick={handleCreateBusiness} 
          disabled={loading || !formData.name || !formData.contact_email}
          className="flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
              צור עסק חדש
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
