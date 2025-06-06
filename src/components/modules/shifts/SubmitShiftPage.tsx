
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, User, CheckCircle, AlertTriangle } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  phone?: string;
}

interface TokenData {
  id: string;
  employee_id: string;
  token: string;
  expires_at: string;
  is_used: boolean;
  employee: Employee;
}

interface ShiftData {
  [day: string]: {
    start_time: string;
    end_time: string;
    branch_preference: string;
    notes: string;
  };
}

export const SubmitShiftPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shifts, setShifts] = useState<ShiftData>({});
  const [generalNotes, setGeneralNotes] = useState('');

  const daysOfWeek = [
    { key: 'sunday', label: 'ראשון' },
    { key: 'monday', label: 'שני' },
    { key: 'tuesday', label: 'שלישי' },
    { key: 'wednesday', label: 'רביעי' },
    { key: 'thursday', label: 'חמישי' },
    { key: 'friday', label: 'שישי' },
    { key: 'saturday', label: 'שבת' }
  ];

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase
        .from('shift_tokens')
        .select(`
          *,
          employee:employees(id, first_name, last_name, employee_id, phone)
        `)
        .eq('token', token)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        toast({
          title: 'טוקן לא תקין',
          description: 'הטוקן פג תוקף או כבר נוצל',
          variant: 'destructive',
        });
        return;
      }

      setTokenData(data as TokenData);

      // Initialize empty shifts
      const initialShifts: ShiftData = {};
      daysOfWeek.forEach(day => {
        initialShifts[day.key] = {
          start_time: '',
          end_time: '',
          branch_preference: '',
          notes: ''
        };
      });
      setShifts(initialShifts);
      
    } catch (error) {
      console.error('Error validating token:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בבדיקת הטוקן',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShiftChange = (day: string, field: string, value: string) => {
    setShifts(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenData || !token) return;

    setSubmitting(true);

    try {
      // Filter out empty shifts
      const validShifts = Object.entries(shifts)
        .filter(([_, shift]) => shift.start_time && shift.end_time)
        .map(([day, shift]) => ({
          day,
          ...shift
        }));

      if (validShifts.length === 0) {
        toast({
          title: 'שגיאה',
          description: 'יש להזין לפחות משמרת אחת',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Insert shift request
      const { error: shiftError } = await supabase
        .from('employee_shift_requests')
        .insert(
          validShifts.map(shift => ({
            employee_id: tokenData.employee_id,
            shift_date: new Date().toISOString().split('T')[0], // Today's date as placeholder
            start_time: shift.start_time,
            end_time: shift.end_time,
            branch_preference: shift.branch_preference,
            notes: shift.notes || generalNotes,
            submission_token: tokenData.id,
          }))
        );

      if (shiftError) throw shiftError;

      // Mark token as used
      const { error: updateError } = await supabase
        .from('shift_tokens')
        .update({ 
          is_used: true,
          submitted_data: { shifts: validShifts, general_notes: generalNotes }
        })
        .eq('token', token);

      if (updateError) throw updateError;

      setSubmitted(true);
      toast({
        title: 'הצלחה!',
        description: 'המשמרות נשלחו בהצלחה',
      });

      // Redirect after success
      setTimeout(() => {
        navigate('/shift-submitted');
      }, 2000);

    } catch (error) {
      console.error('Error submitting shifts:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בשליחת המשמרות',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">בודק טוקן...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">טוקן לא תקין</h2>
            <p className="text-gray-600">הטוקן פג תוקף או כבר נוצל</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">נשלח בהצלחה!</h2>
            <p className="text-gray-600 mb-4">המשמרות שלך נשלחו בהצלחה</p>
            <p className="text-sm text-gray-500">מועבר לעמוד אישור...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">
                  הגשת בקשות משמרות
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  {tokenData.employee.first_name} {tokenData.employee.last_name} | 
                  מס' עובד: {tokenData.employee.employee_id}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Days Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {daysOfWeek.map((day) => (
              <Card key={day.key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    {day.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        שעת התחלה
                      </label>
                      <Input
                        type="time"
                        value={shifts[day.key]?.start_time || ''}
                        onChange={(e) => handleShiftChange(day.key, 'start_time', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        שעת סיום
                      </label>
                      <Input
                        type="time"
                        value={shifts[day.key]?.end_time || ''}
                        onChange={(e) => handleShiftChange(day.key, 'end_time', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      העדפת סניף
                    </label>
                    <Input
                      type="text"
                      placeholder="לדוגמה: סניף ראשי"
                      value={shifts[day.key]?.branch_preference || ''}
                      onChange={(e) => handleShiftChange(day.key, 'branch_preference', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      הערות
                    </label>
                    <Input
                      type="text"
                      placeholder="הערות נוספות..."
                      value={shifts[day.key]?.notes || ''}
                      onChange={(e) => handleShiftChange(day.key, 'notes', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* General Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">הערות כלליות</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="הערות כלליות לשבוע..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                rows={3}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="p-6">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    שולח...
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 mr-2" />
                    שלח בקשות משמרות
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};
