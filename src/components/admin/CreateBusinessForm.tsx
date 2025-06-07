
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Mail, User, Phone, AlertTriangle } from 'lucide-react';

interface BusinessFormData {
  name: string;
  admin_email: string;
  contact_phone: string;
  address: string;
  description: string;
  admin_full_name: string;
}

export const CreateBusinessForm: React.FC = () => {
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    admin_email: '',
    contact_phone: '',
    address: '',
    description: '',
    admin_full_name: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [createUser, setCreateUser] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const createBusinessWithUser = async () => {
    if (!formData.name || !formData.admin_email || !formData.admin_full_name) {
      toast({
        title: 'שגיאה',
        description: 'יש למלא את כל השדות הנדרשים',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Starting business creation process...');
      
      // Step 1: Create the business first
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: formData.name,
          admin_email: formData.admin_email,
          contact_email: formData.admin_email,
          contact_phone: formData.contact_phone,
          address: formData.address,
          description: formData.description,
          is_active: true
        })
        .select()
        .single();

      if (businessError) {
        console.error('Error creating business:', businessError);
        throw new Error('שגיאה ביצירת העסק');
      }

      console.log('✅ Business created successfully:', business.name);

      let userCreationResult = null;
      
      if (createUser) {
        // Step 2: Create user with default password 123456
        console.log('👤 Creating admin user...');
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.admin_email,
          password: '123456',
          email_confirm: true,
          user_metadata: {
            full_name: formData.admin_full_name,
            business_id: business.id,
            role: 'business_admin'
          }
        });

        if (authError) {
          console.error('Error creating user:', authError);
          
          // Try to clean up the business if user creation failed
          await supabase.from('businesses').delete().eq('id', business.id);
          throw new Error('שגיאה ביצירת המשתמש למנהל העסק');
        }

        console.log('✅ User created successfully:', authData.user.email);

        // Step 3: Update business with owner_id
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ owner_id: authData.user.id })
          .eq('id', business.id);

        if (updateError) {
          console.error('Error updating business owner:', updateError);
          // Don't fail the entire process for this
        }

        // Step 4: Create profile record for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: formData.admin_email,
            full_name: formData.admin_full_name,
            role: 'business_admin',
            business_id: business.id
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't fail for profile creation error
        }

        userCreationResult = { success: true, email: formData.admin_email };
      }

      // Step 5: Create default business module configurations
      const defaultModules = [
        'shift_management',
        'employee_documents', 
        'employee_notes',
        'salary_management',
        'employee_contacts',
        'branch_management',
        'employee_attendance'
      ];

      const { error: modulesError } = await supabase
        .from('business_module_config')
        .insert(
          defaultModules.map(module_key => ({
            business_id: business.id,
            module_key,
            is_enabled: true,
            enabled_by: userCreationResult ? business.owner_id : null,
            enabled_at: new Date().toISOString()
          }))
        );

      if (modulesError) {
        console.error('Error creating default modules:', modulesError);
        // Don't fail the entire process for module configuration errors
      }

      // Step 6: Log the business creation activity
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser.user) {
        const { error: logError } = await supabase
          .from('activity_logs')
          .insert({
            user_id: currentUser.user.id,
            action: 'business_created',
            target_type: 'business',
            target_id: business.id,
            details: {
              business_name: business.name,
              admin_email: formData.admin_email,
              user_created: !!userCreationResult,
              created_at: new Date().toISOString()
            }
          });

        if (logError) {
          console.error('Error logging activity:', logError);
        }
      }

      // Show success message
      if (createUser && userCreationResult?.success) {
        toast({
          title: 'הצלחה! 🎉',
          description: `העסק "${business.name}" נוצר והמשתמש נוצר בהצלחה`,
        });
        
        toast({
          title: 'פרטי כניסה ראשוניים',
          description: `המייל: ${formData.admin_email}\nהסיסמה הראשונית: 123456`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'הצלחה!',
          description: `העסק "${business.name}" נוצר בהצלחה`,
        });
      }

      // Navigate back to admin dashboard
      navigate('/admin');

    } catch (error) {
      console.error('💥 Error in createBusinessWithUser:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'שגיאה ביצירת העסק',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          יצירת עסק חדש
        </h1>
        <p className="text-gray-600 mt-2">הזן את פרטי העסק והמנהל הראשי</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              פרטי העסק
            </CardTitle>
            <CardDescription>מידע בסיסי על העסק</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">שם העסק *</Label>
              <Input
                id="businessName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="הכנס את שם העסק"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">תיאור העסק</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="תיאור קצר על העסק..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="03-1234567"
                />
              </div>
              <div>
                <Label htmlFor="address">כתובת</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="כתובת העסק"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              פרטי המנהל הראשי
            </CardTitle>
            <CardDescription>
              {createUser 
                ? "משתמש זה יקבל הרשאות מנהל מלאות בעסק"
                : "רק פרטי העסק ייווצרו ללא משתמש"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Switch
                  checked={createUser}
                  onCheckedChange={setCreateUser}
                />
                <div>
                  <span className="font-medium">יצירת משתמש מנהל</span>
                  <p className="text-sm text-gray-600">יצירת חשבון עם פרטי כניסה</p>
                </div>
              </div>
            </div>

            {createUser && (
              <>
                <div>
                  <Label htmlFor="adminName">שם מלא *</Label>
                  <Input
                    id="adminName"
                    value={formData.admin_full_name}
                    onChange={(e) => handleInputChange('admin_full_name', e.target.value)}
                    placeholder="שם המנהל הראשי"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="adminEmail">כתובת מייל *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={formData.admin_email}
                    onChange={(e) => handleInputChange('admin_email', e.target.value)}
                    placeholder="admin@company.com"
                    required
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">סיסמה ראשונית</span>
                  </div>
                  <p className="text-blue-600 text-sm mt-1">
                    המנהל יקבל סיסמה ראשונית: <strong>123456</strong>
                    <br />
                    יש להחליף אותה בהתחברות הראשונה.
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">הערה חשובה:</p>
                    <p className="text-amber-700">
                      יצירת המשתמש תתבצע עם הרשאות מנהל עסק. 
                      המשתמש יקבל גישה מלאה לכל מודולי העסק.
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Button 
          onClick={createBusinessWithUser}
          disabled={loading || !formData.name || (createUser && (!formData.admin_email || !formData.admin_full_name))}
          className="w-full"
          size="lg"
        >
          {loading ? 'יוצר עסק...' : 'צור עסק חדש'}
        </Button>
      </div>
    </div>
  );
};
