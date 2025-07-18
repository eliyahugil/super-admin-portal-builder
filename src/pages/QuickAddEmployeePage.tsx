import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Loader2, User, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const QuickAddEmployeePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const token = searchParams.get('token');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employee_type: 'hourly',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        console.log('❌ No token provided');
        setTokenValid(false);
        return;
      }

      console.log('⚠️ Quick add token system has been removed');
      setTokenValid(false);
      toast({
        title: 'מערכת לא פעילה',
        description: 'מערכת הוספת עובדים מהירה הוסרה מהמערכת',
        variant: 'destructive',
      });
      setLoading(false);
    };

    checkToken();
  }, [token, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenValid || !businessInfo) return;

    setSubmitting(true);
    try {
      console.log('⚠️ Quick add functionality has been removed');
      toast({
        title: 'מערכת לא פעילה',
        description: 'מערכת הוספת עובדים מהירה הוסרה מהמערכת',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בתהליך ההוספה',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">בודק תוקף הטוקן...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">מערכת לא פעילה</h2>
              <p className="text-gray-600 mb-4">
                מערכת הוספת עובדים מהירה הוסרה מהמערכת
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                חזרה לדף הבית
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <CardTitle>הוספת עובד חדש</CardTitle>
                <CardDescription>
                  {businessInfo?.name && `עסק: ${businessInfo.name}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Alert className="mb-6">
              <AlertDescription>
                ⚠️ מערכת הוספת עובדים מהירה הוסרה מהמערכת. 
                אנא פנה למנהל המערכת להוספת עובדים חדשים.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">שם פרטי *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      required
                      className="pl-10"
                      placeholder="הזן שם פרטי"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">שם משפחה *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      required
                      className="pl-10"
                      placeholder="הזן שם משפחה"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">כתובת דוא"ל</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    placeholder="example@email.com"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">מספר טלפון</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                    placeholder="050-1234567"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_type">סוג עובד</Label>
                <Select value={formData.employee_type} onValueChange={(value) => handleInputChange('employee_type', value)} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">שכיר לפי שעה</SelectItem>
                    <SelectItem value="monthly">שכיר חודשי</SelectItem>
                    <SelectItem value="contractor">קבלן</SelectItem>
                    <SelectItem value="intern">מתמחה</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">הערות נוספות</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="הערות נוספות על העובד..."
                  className="min-h-[80px]"
                  disabled
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={submitting || !tokenValid}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      מוסיף עובד...
                    </>
                  ) : (
                    'הוסף עובד'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  ביטול
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickAddEmployeePage;