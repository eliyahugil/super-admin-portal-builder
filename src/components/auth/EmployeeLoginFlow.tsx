import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, ArrowRight } from 'lucide-react';

export const EmployeeLoginFlow: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'verify'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone login state
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 Attempting email login for employee:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        toast({
          title: 'שגיאה בהתחברות',
          description: 'אימייל או סיסמה שגויים',
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Login successful:', data.user?.email);
      toast({
        title: 'התחברות בוצעה בהצלחה',
        description: 'ברוך הבא למערכת',
      });

    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה לא צפויה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    setLoading(true);

    try {
      // Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);

      console.log('📱 Sending verification code to:', phone);

      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: { phone, code },
      });

      if (error) {
        console.error('❌ SMS error:', error);
        toast({
          title: 'שגיאה בשליחת SMS',
          description: error.message || 'לא הצלחנו לשלוח קוד אימות. בדוק את המספר ונסה שוב.',
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ SMS sent successfully');
      toast({
        title: 'קוד נשלח',
        description: 'קוד האימות נשלח לטלפון שלך',
      });

      setStep('verify');

    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בשליחת הקוד',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCodeAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (verificationCode !== generatedCode) {
        toast({
          title: 'קוד שגוי',
          description: 'הקוד שהוזן אינו תואם. נסה שוב.',
          variant: 'destructive',
        });
        return;
      }

      // Find employee by phone number
      const { data: employees, error: searchError } = await supabase
        .from('employees')
        .select('*')
        .eq('phone', phone)
        .eq('is_active', true)
        .single();

      if (searchError || !employees) {
        console.error('❌ Employee not found:', searchError);
        toast({
          title: 'עובד לא נמצא',
          description: 'מספר הטלפון לא רשום במערכת',
          variant: 'destructive',
        });
        return;
      }

      // For demo purposes, we'll create a session for the employee
      // In a real app, you'd need a proper authentication system for employees
      console.log('✅ Employee verified:', employees.first_name, employees.last_name);
      
      toast({
        title: 'אימות בוצע בהצלחה',
        description: `ברוך הבא ${employees.first_name} ${employees.last_name}`,
      });

      // Store employee info in localStorage for demo
      localStorage.setItem('employee_session', JSON.stringify({
        id: employees.id,
        name: `${employees.first_name} ${employees.last_name}`,
        phone: employees.phone,
        business_id: employees.business_id,
      }));

      // Redirect to employee dashboard or refresh page
      window.location.reload();

    } catch (error) {
      console.error('❌ Verification error:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה באימות',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">אימות קוד SMS</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={verifyCodeAndLogin} className="space-y-4">
            <div>
              <Label>קוד אימות נשלח ל: {phone}</Label>
              <Input
                type="text"
                placeholder="הזן קוד 6 ספרות"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                dir="ltr"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? 'מאמת...' : 'אמת והתחבר'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setStep('login');
                setVerificationCode('');
                setGeneratedCode('');
              }}
            >
              חזור לשלב הקודם
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">התחברות עובדים</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as 'email' | 'phone')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              אימייל
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              טלפון
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">כתובת אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="הזן סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'מתחבר...' : 'התחבר'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="phone">
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">מספר טלפון</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="050-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  הכנס מספר בפורמט ישראלי (לדוגמה: 050-1234567)
                </p>
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={sendVerificationCode}
                disabled={loading || !phone.trim()}
              >
                {loading ? 'שולח קוד...' : (
                  <>
                    שלח קוד אימות
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};