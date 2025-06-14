
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Building, Mail, Phone, User, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const toggleModule = (moduleKey: string) => {
    setActiveModules(prev => 
      prev.includes(moduleKey)
        ? prev.filter(key => key !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.name.trim()) {
      newErrors.push('שם העסק הוא שדה חובה');
    }
    
    if (!formData.admin_email.trim()) {
      newErrors.push('מייל מנהל העסק הוא שדה חובה');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) {
      newErrors.push('מייל מנהל העסק אינו תקין');
    }
    
    if (activeModules.length === 0) {
      newErrors.push('יש לבחור לפחות מודול אחד');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleCreateBusiness = async () => {
    if (!validateForm()) {
      toast({
        title: 'שגיאות בטופס',
        description: 'יש לתקן את השגיאות המוצגות',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setErrors([]);
    
    try {
      console.log('🚀 Starting business creation with enhanced logging...');
      
      // Step 1: Create the business
      console.log('📝 Creating business with data:', {
        name: formData.name,
        admin_email: formData.admin_email,
        modules: activeModules
      });

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
        throw new Error(`שגיאה ביצירת העסק: ${businessError.message}`);
      }

      console.log('✅ Business created successfully:', business);

      // Step 2: Add modules
      if (activeModules.length > 0) {
        console.log('📦 Adding modules to business...');
        const { data: currentUser } = await supabase.auth.getUser();
        
        const moduleInserts = activeModules.map(moduleKey => ({
          business_id: business.id,
          module_key: moduleKey,
          is_enabled: true,
          enabled_by: currentUser.user?.id,
          enabled_at: new Date().toISOString(),
        }));

        const { error: moduleError } = await supabase
          .from('business_module_config')
          .insert(moduleInserts);

        if (moduleError) {
          console.warn('⚠️ Module error (non-critical):', moduleError);
        } else {
          console.log('✅ Modules added successfully');
        }
      }

      // Step 3: Create admin user if requested
      if (sendInvitation) {
        console.log('👤 Creating admin user via Edge Function...');
        
        try {
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-business-admin', {
            body: {
              businessData: {
                name: formData.name,
                contact_phone: formData.contact_phone,
                address: formData.address,
                description: formData.description,
                selectedModules: activeModules
              },
              adminData: {
                email: formData.admin_email,
                full_name: `מנהל ${formData.name}`
              }
            }
          });

          if (edgeError) {
            console.error('⚠️ Edge function error:', edgeError);
            throw new Error(`שגיאה ביצירת המנהל: ${edgeError.message}`);
          }

          if (edgeData && !edgeData.success) {
            console.error('⚠️ Edge function returned error:', edgeData.error);
            throw new Error(`שגיאה ביצירת המנהל: ${edgeData.error}`);
          }

          console.log('✅ Admin user created successfully via edge function');
          
        } catch (edgeError) {
          console.warn('⚠️ Edge function failed, trying direct approach...', edgeError);
          
          // Fallback: try creating user directly
          const tempPassword = 'TempPass123!';
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: formData.admin_email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              business_id: business.id,
              business_name: formData.name,
              role: 'business_admin',
              full_name: `מנהל ${formData.name}`
            }
          });

          if (authError) {
            console.error('❌ Fallback auth creation failed:', authError);
            toast({
              title: 'אזהרה',
              description: `העסק נוצר בהצלחה אך לא ניתן ליצור משתמש למנהל. יש ליצור אותו ידנית.`,
              variant: 'destructive',
            });
          } else {
            console.log('✅ Fallback user creation succeeded');
            
            // Update business with owner
            await supabase
              .from('businesses')
              .update({ owner_id: authData.user?.id })
              .eq('id', business.id);

            toast({
              title: 'פרטי כניסה זמניים',
              description: `המייל: ${formData.admin_email}\nהסיסמה הזמנית: ${tempPassword}`,
            });
          }
        }
      }

      setSuccess(true);
      
      toast({
        title: 'הצלחה! 🎉',
        description: `העסק "${business.name}" נוצר בהצלחה`,
      });

      // Navigate after a short delay to show success state
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (error) {
      console.error('💥 Error creating business:', error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
      setErrors([errorMessage]);
      
      toast({
        title: 'שגיאה',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl" dir="rtl">
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">העסק נוצר בהצלחה!</h2>
            <p className="text-gray-600 mb-4">העסק "{formData.name}" נוסף למערכת</p>
            <p className="text-sm text-gray-500">מעביר אותך לדשבורד הראשי...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Error Display */}
      {errors.length > 0 && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

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
                required
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
                  required
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
        <Button variant="outline" onClick={() => navigate('/admin')} disabled={loading}>
          ביטול
        </Button>
        <Button 
          onClick={handleCreateBusiness} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              יוצר עסק...
            </>
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
