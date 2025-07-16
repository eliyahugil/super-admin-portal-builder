import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOperations } from './useAuthOperations';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface BusinessInfo {
  business_id: string;
  business_name: string;
  code_is_active: boolean;
  code_valid: boolean;
}

export const QuickRegistration: React.FC = () => {
  const [step, setStep] = useState<'code' | 'details' | 'success'>('code');
  const [registrationCode, setRegistrationCode] = useState('');
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // פרטי המשתמש
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  const { toast } = useToast();
  const { signUp } = useAuthOperations();

  const validateCode = async () => {
    if (!registrationCode.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין קוד הרשמה",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase
        .rpc('get_business_by_registration_code', {
          code_param: registrationCode.trim().toUpperCase()
        });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "קוד לא תקין",
          description: "קוד ההרשמה שהוזן אינו קיים במערכת",
          variant: "destructive",
        });
        return;
      }

      const businessData = data[0];

      if (!businessData.code_is_active) {
        toast({
          title: "קוד לא פעיל",
          description: "קוד ההרשמה אינו פעיל כרגע",
          variant: "destructive",
        });
        return;
      }

      if (!businessData.code_valid) {
        toast({
          title: "קוד לא זמין",
          description: "קוד ההרשמה הגיע למגבלת השימושים",
          variant: "destructive",
        });
        return;
      }

      setBusinessInfo(businessData);
      setStep('details');

    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: `שגיאה בבדיקת הקוד: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.fullName) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // הרשמה לאימות (רק יצירת החשבון)
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone
      );

      if (error) throw error;

      if (data?.user) {
        // יצירת בקשת גישה עם קוד ההרשמה
        const { error: requestError } = await supabase
          .from('user_access_requests')
          .insert({
            user_id: data.user.id,
            requested_business_id: businessInfo!.business_id,
            requested_role: 'business_user',
            request_reason: `הרשמה מהירה עם קוד: ${registrationCode}`,
            registration_code: registrationCode.trim().toUpperCase()
          });

        if (requestError) throw requestError;

        // עדכון מונה השימושים של הקוד
        const { error: updateError } = await supabase
          .rpc('increment_registration_code_usage', {
            code_param: registrationCode.trim().toUpperCase()
          });

        if (updateError) {
          console.warn('Failed to update usage count:', updateError);
        }

        setStep('success');
      }

    } catch (error: any) {
      toast({
        title: "שגיאה בהרשמה",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-green-700">הרשמה הושלמה בהצלחה!</h2>
              <div className="space-y-2 text-gray-600">
                <p>בקשת הגישה שלך נשלחה לאישור מנהל המערכת</p>
                <p className="font-medium">עסק: {businessInfo?.business_name}</p>
                <p>תקבל הודעה במייל ברגע שהבקשה תאושר</p>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  אנא בדוק את תיבת המייל שלך לאימות כתובת המייל
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">הרשמה מהירה למערכת</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'code' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">קוד הרשמה</Label>
                <Input
                  id="code"
                  type="text"
                  value={registrationCode}
                  onChange={(e) => setRegistrationCode(e.target.value.toUpperCase())}
                  placeholder="הזן קוד הרשמה"
                  className="text-center font-mono text-lg"
                  maxLength={8}
                />
                <p className="text-sm text-gray-500">
                  קבל את קוד ההרשמה ממנהל העסק שלך
                </p>
              </div>
              <Button
                onClick={validateCode}
                disabled={isValidating}
                className="w-full"
              >
                {isValidating ? 'בודק...' : 'המשך'}
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
            </div>
          )}

          {step === 'details' && businessInfo && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  הרשמה לעסק: <strong>{businessInfo.business_name}</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="fullName">שם מלא *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">כתובת מייל *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">סיסמה *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                />
                <p className="text-sm text-gray-500">לפחות 6 תווים</p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('code')}
                  className="flex-1"
                >
                  חזור
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'נרשם...' : 'הירשם'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};