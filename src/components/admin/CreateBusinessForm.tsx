
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
import { AddressField } from '@/components/ui/address';
import type { AddressData } from '@/components/ui/address';

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleAddressChange = (addressData: AddressData | null) => {
    setFormData(prev => ({
      ...prev,
      address: addressData?.formatted_address || ''
    }));
  };

  const createBusinessWithUser = async () => {
    if (!formData.name || !formData.admin_email || !formData.admin_full_name) {
      const errorMsg = 'יש למלא את כל השדות הנדרשים';
      setError(errorMsg);
      toast({
        title: 'שגיאה',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting business creation via Edge Function...');
      
      if (!createUser) {
        // If not creating user, just create business directly
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
          throw new Error(`שגיאה ביצירת העסק: ${businessError.message}`);
        }

        toast({
          title: 'הצלחה!',
          description: `העסק "${business.name}" נוצר בהצלחה`,
        });
        navigate('/admin');
        return;
      }

      // Use Edge Function to create both business and admin user
      const { data, error } = await supabase.functions.invoke('create-business-admin', {
        body: {
          businessData: {
            name: formData.name,
            contact_phone: formData.contact_phone,
            address: formData.address,
            description: formData.description,
            selectedModules: [
              'shift_management',
              'employee_documents',
              'employee_notes',
              'salary_management',
              'employee_contacts',
              'branch_management',
              'employee_attendance'
            ]
          },
          adminData: {
            email: formData.admin_email,
            full_name: formData.admin_full_name
          },
          subscriptionData: null
        }
      });

      if (error) {
        console.error('❌ Error from Edge Function:', error);
        throw new Error(error.message || 'שגיאה ביצירת העסק והמנהל');
      }

      if (!data.success) {
        throw new Error(data.error || 'שגיאה ביצירת העסק והמנהל');
      }

      console.log('✅ Business and admin created successfully:', data);

      // Show success messages
      toast({
        title: 'הצלחה! 🎉',
        description: `העסק "${data.business.name}" והמנהל נוצרו בהצלחה`,
      });
      
      toast({
        title: 'פרטי כניסה למנהל העסק',
        description: `המייל: ${data.admin.email}\nהסיסמה הראשונית: 123456\n\nיש להחליף את הסיסמה בהתחברות הראשונה`,
        variant: 'default',
      });

      // Navigate back to admin dashboard
      navigate('/admin');

    } catch (error) {
      console.error('💥 Error in createBusinessWithUser:', error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה ביצירת העסק';
      setError(errorMessage);
      
      toast({
        title: 'שגיאה',
        description: errorMessage,
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

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">שגיאה</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

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
                <AddressField
                  label="כתובת העסק"
                  value={formData.address}
                  onChange={handleAddressChange}
                  placeholder="הקלד כתובת העסק..."
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
