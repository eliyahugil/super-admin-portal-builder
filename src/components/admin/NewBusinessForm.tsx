
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, User, Settings, Phone, Mail } from 'lucide-react';

interface BusinessFormData {
  name: string;
  admin_email: string;
  contact_phone: string;
  address: string;
  description: string;
  admin_full_name: string;
}

const availableModules = [
  { key: 'shift_management', label: 'ניהול משמרות', description: 'ניהול משמרות עובדים ולוחות זמנים' },
  { key: 'employee_documents', label: 'מסמכי עובדים', description: 'ניהול מסמכים וקבצים של עובדים' },
  { key: 'employee_notes', label: 'הערות עובדים', description: 'ניהול הערות ותיעוד אישי' },
  { key: 'salary_management', label: 'ניהול שכר', description: 'מעקב היסטוריית שכר ושינויים' },
  { key: 'employee_contacts', label: 'יצירת קשר עובדים', description: 'מערכת תקשורת עם עובדים' },
  { key: 'branch_management', label: 'ניהול סניפים', description: 'ניהול סניפים ומיקומים' },
  { key: 'employee_attendance', label: 'נוכחות עובדים', description: 'מעקב נוכחות וזמני עבודה' },
];

export const NewBusinessForm: React.FC = () => {
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    admin_email: '',
    contact_phone: '',
    address: '',
    description: '',
    admin_full_name: ''
  });
  
  const [selectedModules, setSelectedModules] = useState<string[]>(['shift_management', 'employee_documents']);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleModule = (moduleKey: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleKey)
        ? prev.filter(m => m !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const createBusinessWithModules = async () => {
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

      // Step 5: Create selected business module configurations
      if (selectedModules.length > 0) {
        const { error: modulesError } = await supabase
          .from('business_module_config')
          .insert(
            selectedModules.map(module_key => ({
              business_id: business.id,
              module_key,
              is_enabled: true,
              enabled_by: authData.user.id,
              enabled_at: new Date().toISOString()
            }))
          );

        if (modulesError) {
          console.error('Error creating modules:', modulesError);
          // Don't fail the entire process for module configuration errors
        }
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
              modules_enabled: selectedModules,
              created_at: new Date().toISOString()
            }
          });

        if (logError) {
          console.error('Error logging activity:', logError);
        }
      }

      // Show success message
      toast({
        title: 'הצלחה! 🎉',
        description: `העסק "${business.name}" נוצר והמשתמש נוצר בהצלחה`,
      });
      
      toast({
        title: 'פרטי כניסה ראשוניים',
        description: `המייל: ${formData.admin_email}\nהסיסמה הראשונית: 123456`,
        variant: 'default',
      });

      // Reset form
      setFormData({
        name: '',
        admin_email: '',
        contact_phone: '',
        address: '',
        description: '',
        admin_full_name: ''
      });
      setSelectedModules(['shift_management', 'employee_documents']);

      // Navigate back to admin dashboard
      navigate('/admin');

    } catch (error) {
      console.error('💥 Error in createBusinessWithModules:', error);
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
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          יצירת עסק חדש
        </h1>
        <p className="text-gray-600 mt-2">הזן את פרטי העסק והמנהל הראשי</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Details */}
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

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  טלפון
                </Label>
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

        {/* Admin Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              פרטי המנהל הראשי
            </CardTitle>
            <CardDescription>משתמש זה יקבל הרשאות מנהל מלאות בעסק</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="adminEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                כתובת מייל *
              </Label>
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
          </CardContent>
        </Card>

        {/* Module Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              מודולים זמינים לעסק
            </CardTitle>
            <CardDescription>בחר את המודולים שיהיו זמינים לעסק זה</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableModules.map((module) => (
                <div
                  key={module.key}
                  className="flex items-start space-x-3 space-x-reverse p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedModules.includes(module.key)}
                    onCheckedChange={() => handleToggleModule(module.key)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label className="font-medium cursor-pointer">
                      {module.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {module.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              נבחרו {selectedModules.length} מודולים
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="lg:col-span-2 flex justify-between items-center pt-6">
          <Button 
            variant="outline"
            onClick={() => navigate('/admin')}
          >
            ביטול
          </Button>
          
          <Button 
            onClick={createBusinessWithModules}
            disabled={loading || !formData.name || !formData.admin_email || !formData.admin_full_name}
            size="lg"
          >
            {loading ? 'יוצר עסק...' : 'צור עסק חדש'}
          </Button>
        </div>
      </div>
    </div>
  );
};
