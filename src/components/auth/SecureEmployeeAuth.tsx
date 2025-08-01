import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface SecureEmployeeAuthProps {
  onAuthenticated: (employeeData: any) => void;
  businessId: string;
}

export const SecureEmployeeAuth: React.FC<SecureEmployeeAuthProps> = ({
  onAuthenticated,
  businessId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const { toast } = useToast();

  const MAX_ATTEMPTS = 3;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !password) {
      toast({
        title: 'שגיאה',
        description: 'אנא הכנס מספר טלפון וסיסמה',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simple rate limiting check
      if (attemptCount >= MAX_ATTEMPTS) {
        setIsBlocked(true);
        toast({
          title: 'חשבון חסום',
          description: 'יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Authenticate employee with enhanced security
      const { data, error } = await supabase.functions.invoke('secure-employee-auth', {
        body: {
          phone,
          password,
          businessId,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });

      if (error || !data.success) {
        setAttemptCount(prev => prev + 1);
        
        toast({
          title: 'שגיאת התחברות',
          description: data?.message || 'פרטי התחברות לא נכונים',
          variant: 'destructive'
        });
        
        if (attemptCount >= MAX_ATTEMPTS - 1) {
          setIsBlocked(true);
        }
        
        setIsLoading(false);
        return;
      }

      // Reset attempts on success
      setAttemptCount(0);
      onAuthenticated(data.employee);
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'שגיאת מערכת',
        description: 'אירעה שגיאה במהלך ההתחברות',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isBlocked) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
          <CardTitle className="text-destructive">חשבון חסום</CardTitle>
          <CardDescription>
            זוהו יותר מדי ניסיונות התחברות לא מוצלחים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              מטעמי אבטחה, החשבון נחסם זמנית. 
              אנא נסה שוב מאוחר יותר או פנה למנהל המערכת.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
        <CardTitle>התחברות מאובטחת לעובדים</CardTitle>
        <CardDescription>
          הכנס את פרטי ההתחברות שלך
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">מספר טלפון</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">סיסמה</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {attemptCount > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ניסיון התחברות {attemptCount} מתוך {MAX_ATTEMPTS}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            התחבר
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};