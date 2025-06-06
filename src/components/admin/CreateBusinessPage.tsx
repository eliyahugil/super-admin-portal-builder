import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Building, Mail, Phone, User, Send, AlertTriangle } from 'lucide-react';

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
    admin_email: '',
    contact_phone: '',
    description: '',
    address: '',
  });
  const [activeModules, setActiveModules] = useState<string[]>(['shift_management']);
  const [loading, setLoading] = useState(false);
  const [sendInvitation, setSendInvitation] = useState(true);
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

  const createBusinessUser = async (businessId: string, email: string, businessName: string) => {
    try {
      console.log('🔄 Creating user for business:', businessName, 'Email:', email);
      
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
      
      // Try to create the user account using admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          business_id: businessId,
          business_name: businessName,
          role: 'business_admin'
        }
      });

      if (authError) {
        console.error('❌ Auth admin error:', authError);
        
        // If admin API fails, try regular signup with invitation
        console.log('⚠️ Admin API failed, trying invitation method...');
        
        const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
          data: {
            business_id: businessId,
            business_name: businessName,
            role: 'business_admin'
          }
        });

        if (inviteError) {
          console.error('❌ Invitation also failed:', inviteError);
          throw new Error(`לא ניתן ליצור משתמש: ${inviteError.message}`);
        }

        console.log('✅ Invitation sent successfully');
        return { success: true, method: 'invitation' };
      }

      console.log('✅ User created successfully:', authData.user.email);

      // Update the business with the owner_id
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ owner_id: authData.user.id })
        .eq('id', businessId);

      if (updateError) {
        console.warn('⚠️ Failed to update business owner_id:', updateError);
      }

      // Update the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: 'business_admin',
          full_name: `מנהל ${businessName}`
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.warn('⚠️ Failed to update user profile:', profileError);
      }

      return { success: true, tempPassword, method: 'created' };
    } catch (error) {
      console.error('💥 Error in createBusinessUser:', error);
      return { success: false, error };
    }
  };

  const handleCreateBusiness = async () => {
    if (!formData.name || !formData.admin_email) {
      toast({
        title: 'שגיאה',
        description: 'נא למלא את כל השדות החובה',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Starting business creation process...');
      
      // Create the business with auto-generated UUID
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: formData.name,
          contact_email: formData.contact_email || formData.admin_email,
          admin_email: formData.admin_email,
          contact_phone: formData.contact_phone,
          description: formData.description,
          address: formData.address,
          is_active: true,
        })
        .select()
        .single();

      if (businessError) {
        console.error('❌ Business creation error:', businessError);
        throw businessError;
      }

      console.log('✅ Business created successfully:', business.name);

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;

      // Enable selected modules for the business
      if (activeModules.length > 0) {
        console.log('🔧 Enabling modules:', activeModules);
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
          console.warn('⚠️ Failed to enable some modules:', moduleError);
        } else {
          console.log('✅ Modules enabled successfully');
        }
      }

      let userCreationResult = null;
      if (sendInvitation) {
        console.log('📧 Creating user and sending invitation...');
        userCreationResult = await createBusinessUser(business.id, formData.admin_email, formData.name);
        
        if (!userCreationResult.success) {
          toast({
            title: 'אזהרה',
            description: `העסק נוצר בהצלחה אך לא ניתן ליצור משתמש למנהל: ${userCreationResult.error}`,
            variant: 'destructive',
          });
        }
      }

      // Show success message
      if (sendInvitation && userCreationResult?.success) {
        if (userCreationResult.method === 'created' && userCreationResult.tempPassword) {
          toast({
            title: 'הצלחה!',
            description: `העסק "${business.name}" נוצר והמשתמש נוצר בהצלחה`,
          });
          
          // Show temporary credentials
          toast({
            title: 'פרטי כניסה זמניים',
            description: `המייל: ${formData.admin_email}\nהסיסמה הזמנית: ${userCreationResult.tempPassword}`,
            variant: 'default',
          });
        } else if (userCreationResult.method === 'invitation') {
          toast({
            title: 'הצלחה!',
            description: `העסק "${business.name}" נוצר והזמנה נשלחה למייל ${formData.admin_email}`,
          });
        }
      } else {
        toast({
          title: 'הצלחה!',
          description: `העסק "${business.name}" נוצר בהצלחה`,
        });
      }

      // Navigate back to admin dashboard
      navigate('/admin');
    } catch (error) {
      console.error('💥 Error creating business:', error);
      toast({
        title: 'שגיאה',
        description: `לא ניתן ליצור את העסק: ${error.message || 'שגיאה לא ידועה'}`,
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

      {/* Alert about admin privileges */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-amber-800">חשוב לדעת:</p>
          <p className="text-amber-700">
            יצירת משתמש למנהל העסק דורשת הרשאות מיוחדות. אם תהליך יצירת המשתמש נכשל, 
            העסק עדיין ייווצר ותוכל ליצור את המשתמש ידנית מאוחר יותר.
          </p>
        </div>
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
              <Label htmlFor="admin_email">מייל מנהל העסק *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="admin_email"
                  type="email"
                  value={formData.admin_email}
                  onChange={(e) => handleInputChange('admin_email', e.target.value)}
                  placeholder="admin@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">מייל ליצירת קשר</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="contact@example.com"
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

            {/* User Invitation Option */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={sendInvitation}
                    onCheckedChange={setSendInvitation}
                  />
                  <div>
                    <span className="font-medium">יצירת משתמש למנהל העסק</span>
                    <p className="text-sm text-gray-600">יצירת חשבון ושליחת פרטי כניסה</p>
                  </div>
                </div>
                <Send className="h-4 w-4 text-green-600" />
              </div>
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
          disabled={loading || !formData.name || !formData.admin_email}
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
