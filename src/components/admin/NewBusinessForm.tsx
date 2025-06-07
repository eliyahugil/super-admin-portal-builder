
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
import { Building2, User, Settings, Phone, Mail, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(1);
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.admin_email && formData.admin_full_name);
      case 2:
        return true; // Optional fields
      case 3:
        return selectedModules.length > 0;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      toast({
        title: 'שגיאה',
        description: 'יש למלא את כל השדות הנדרשים',
        variant: 'destructive',
      });
    }
  };

  const createBusinessWithAutoAdmin = async () => {
    if (!validateStep(1)) {
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
      setCurrentStep(1);

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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6 sm:mb-8">
      <div className="flex items-center space-x-2 space-x-reverse">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <ArrowRight
                className={`w-4 h-4 ${
                  step < currentStep ? 'text-blue-600' : 'text-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
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
          </CardContent>
        </Card>

        {/* Admin Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
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
          </CardContent>
        </Card>
      </div>

      {/* Auto Creation Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 text-blue-700 mb-3">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">יצירה אוטומטית</span>
          </div>
          <ul className="text-blue-600 text-sm space-y-1">
            <li>• המערכת תיצור חשבון אוטומטית למנהל</li>
            <li>• הסיסמה הראשונית: 123456</li>
            <li>• המנהל יקבל הרשאות מלאות לעסק</li>
            <li>• יש להחליף את הסיסמה בכניסה הראשונה</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          פרטי יצירת קשר נוספים
        </CardTitle>
        <CardDescription>פרטים נוספים (אופציונלי)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          מודולים זמינים לעסק
        </CardTitle>
        <CardDescription>בחר את המודולים שיהיו זמינים לעסק זה</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availableModules.map((module) => (
            <div
              key={module.key}
              className="flex items-start space-x-3 space-x-reverse p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                checked={selectedModules.includes(module.key)}
                onCheckedChange={() => handleToggleModule(module.key)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <Label className="font-medium cursor-pointer text-sm sm:text-base">
                  {module.label}
                </Label>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
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
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6" dir="rtl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Building2 className="h-6 w-6 sm:h-8 sm:w-8" />
          יצירת עסק חדש + מנהל אוטומטי
        </h1>
        <p className="text-gray-600 flex items-center gap-2 text-sm sm:text-base">
          <Sparkles className="h-4 w-4 text-blue-500" />
          המערכת תיצור אוטומטית את העסק ואת חשבון המנהל
        </p>
      </div>

      {renderStepIndicator()}

      <div className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6">
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate('/admin')}
              className="flex-1 sm:flex-initial"
            >
              ביטול
            </Button>
            {currentStep > 1 && (
              <Button 
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex-1 sm:flex-initial"
              >
                חזור
              </Button>
            )}
          </div>
          
          {currentStep < 3 ? (
            <Button 
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className="flex items-center gap-2"
            >
              המשך
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={createBusinessWithAutoAdmin}
              disabled={loading || !validateStep(1)}
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
          )}
        </div>
      </div>
    </div>
  );
};
