
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
import { Building2, User, Settings, Phone, Mail, AlertTriangle, Sparkles } from 'lucide-react';

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

  const createBusinessWithAutoAdmin = async () => {
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
      console.log('🚀 Starting automatic business and admin creation...');
      
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('לא מחובר למערכת');
      }

      // Call the Edge Function to create business and admin user
      const { data, error } = await supabase.functions.invoke('create-business-admin', {
        body: {
          businessData: {
            name: formData.name,
            contact_phone: formData.contact_phone,
            address: formData.address,
            description: formData.description,
            selectedModules
          },
          adminData: {
            email: formData.admin_email,
            full_name: formData.admin_full_name
          }
        }
      });

      if (error) {
        console.error('Error from Edge Function:', error);
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
      console.error('💥 Error in createBusinessWithAutoAdmin:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'שגיאה ביצירת העסק והמנהל',
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
          יצירת עסק חדש + מנהל אוטומטי
        </h1>
        <p className="text-gray-600 mt-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          המערכת תיצור אוטומטית את העסק ואת חשבון המנהל
        </p>
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
            <CardDescription>המנהל יקבל חשבון אוטומטית עם הרשאות מלאות</CardDescription>
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
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">יצירה אוטומטית</span>
              </div>
              <ul className="text-blue-600 text-sm mt-1 space-y-1">
                <li>• המערכת תיצור חשבון אוטומטית למנהל</li>
                <li>• הסיסמה הראשונית: 123456</li>
                <li>• המנהל יקבל הרשאות מלאות לעסק</li>
                <li>• יש להחליף את הסיסמה בכניסה הראשונה</li>
              </ul>
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
            onClick={createBusinessWithAutoAdmin}
            disabled={loading || !formData.name || !formData.admin_email || !formData.admin_full_name}
            size="lg"
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                יוצר עסק ומנהל...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                צור עסק + מנהל אוטומטי
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
