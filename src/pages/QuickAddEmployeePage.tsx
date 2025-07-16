import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const QuickAddEmployeePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setTokenValid(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      console.log('🔍 Validating token:', token);
      
      if (!token) {
        console.log('❌ No token provided');
        setTokenValid(false);
        return;
      }

      // Check token in database instead of localStorage
      const { data: tokenRecord, error } = await supabase
        .from('employee_quick_add_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_used', false)
        .single();

      if (error || !tokenRecord) {
        console.log('❌ Token not found in database:', error);
        setTokenValid(false);
        toast({
          title: 'טוקן לא תקין',
          description: 'הטוקן אינו תקין או לא קיים',
          variant: 'destructive',
        });
        return;
      }

      console.log('📄 Token record found:', tokenRecord);

      // Check if token is expired
      const expiresAt = new Date(tokenRecord.expires_at);
      const now = new Date();
      console.log('⏰ Checking expiry:', { expiresAt, now, expired: expiresAt < now });
      
      if (expiresAt < now) {
        setTokenValid(false);
        toast({
          title: 'טוקן פג תוקף',
          description: 'הטוקן פג תוקף, אנא בקש טוקן חדש',
          variant: 'destructive',
        });
        return;
      }

      // Check if token is already used
      if (tokenRecord.is_used) {
        console.log('❌ Token already used');
        setTokenValid(false);
        toast({
          title: 'טוקן נוצל',
          description: 'הטוקן כבר נוצל להוספת עובד',
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Token is valid');
      setTokenData(tokenRecord);
      setTokenValid(true);
    } catch (error) {
      console.error('Error validating token:', error);
      setTokenValid(false);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בבדיקת הטוקן',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenData || !tokenValid) return;

    setLoading(true);
    try {
      // Add employee to database
      const { error: employeeError } = await supabase
        .from('employees')
        .insert({
          business_id: tokenData.business_id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          email: formData.email,
          employee_type: 'permanent',
          is_active: true,
          is_archived: false,
          created_at: new Date().toISOString()
        });

      if (employeeError) {
        console.error('Error adding employee:', employeeError);
        toast({
          title: 'שגיאה',
          description: 'אירעה שגיאה בהוספת העובד',
          variant: 'destructive',
        });
        return;
      }

      // Mark token as used in database
      const { error: updateError } = await supabase
        .from('employee_quick_add_tokens')
        .update({ 
          is_used: true, 
          used_at: new Date().toISOString() 
        })
        .eq('token', token);

      if (updateError) {
        console.error('Error updating token:', updateError);
      }

      toast({
        title: 'הצלחה!',
        description: `העובד ${formData.first_name} ${formData.last_name} נוסף בהצלחה למערכת`,
      });

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: ''
      });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בהוספת העובד',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>בודק תוקף הטוקן...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">טוקן לא תקין</h2>
            <p className="text-muted-foreground mb-4">
              הטוקן אינו תקין, פג תוקף או כבר נוצל.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              חזרה לעמוד הבית
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl">הוספת עובד מהירה</CardTitle>
            <p className="text-sm text-muted-foreground">
              מלא את הפרטים הבסיסיים להוספת עובד חדש
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">שם פרטי *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="הכנס שם פרטי"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">שם משפחה *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="הכנס שם משפחה"
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
                  placeholder="הכנס מספר טלפון"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="הכנס כתובת אימייל"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      מוסיף עובד...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      הוסף עובד
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>הערה:</strong> העובד יווסף עם פרטים בסיסיים. ניתן לעדכן פרטים נוספים במערכת הניהול.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};