
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { WeeklyShiftService, ShiftEntry, WeeklySubmissionData } from '@/services/WeeklyShiftService';
import { Clock, MapPin, User, Calendar, Plus, Trash2, AlertTriangle } from 'lucide-react';

export const WeeklyShiftSubmissionForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shifts, setShifts] = useState<ShiftEntry[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        console.error('❌ No token provided');
        toast({
          title: 'שגיאה',
          description: 'לא נמצא טוקן תקף',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      try {
        console.log('🔍 Validating weekly token:', token);
        
        const data = await WeeklyShiftService.validateWeeklyToken(token);
        if (!data) {
          console.error('❌ Token validation failed - invalid or expired');
          toast({
            title: 'טוקן לא תקף',
            description: 'הטוקן פג תוקף או כבר נוצל',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        // Validate that we have all required employee data
        if (!data.employee || !data.employee.first_name || !data.employee.last_name) {
          console.error('❌ Missing employee data:', data.employee);
          toast({
            title: 'שגיאה בנתוני המשתמש',
            description: 'חסרים פרטי עובד. אנא פנה למנהל המערכת.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        console.log('✅ Token validated successfully:', {
          employeeId: data.employee_id,
          employeeName: `${data.employee.first_name} ${data.employee.last_name}`,
          employeeIdNumber: data.employee.employee_id,
          weekStart: data.week_start_date,
          weekEnd: data.week_end_date
        });

        setTokenData(data);
        
        // Initialize with one empty shift
        setShifts([{
          date: '',
          start_time: '',
          end_time: '',
          branch_preference: '',
          role_preference: '',
          notes: '',
        }]);
      } catch (error) {
        console.error('💥 Token validation error:', error);
        toast({
          title: 'שגיאה',
          description: 'שגיאה בבדיקת הטוקן',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, navigate, toast]);

  const addShift = () => {
    setShifts([...shifts, {
      date: '',
      start_time: '',
      end_time: '',
      branch_preference: '',
      role_preference: '',
      notes: '',
    }]);
  };

  const removeShift = (index: number) => {
    if (shifts.length > 1) {
      setShifts(shifts.filter((_, i) => i !== index));
    }
  };

  const updateShift = (index: number, field: keyof ShiftEntry, value: string) => {
    const updatedShifts = [...shifts];
    updatedShifts[index] = { ...updatedShifts[index], [field]: value };
    setShifts(updatedShifts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !tokenData) {
      console.error('❌ Missing token or token data');
      toast({
        title: 'שגיאה',
        description: 'חסרים נתוני טוקן',
        variant: 'destructive',
      });
      return;
    }

    // Validate employee data
    if (!tokenData.employee || !tokenData.employee.first_name || !tokenData.employee.last_name) {
      console.error('❌ Missing employee data for submission:', tokenData.employee);
      toast({
        title: 'שגיאה בנתוני המשתמש',
        description: 'חסרים פרטי עובד. אנא רענן את הדף ונסה שוב.',
        variant: 'destructive',
      });
      return;
    }

    // Filter out empty shifts
    const validShifts = shifts.filter(shift => 
      shift.date && shift.start_time && shift.end_time && shift.branch_preference
    );

    if (validShifts.length === 0) {
      toast({
        title: 'שגיאה',
        description: 'יש להוסיף לפחות משמרת אחת תקינה',
        variant: 'destructive',
      });
      return;
    }

    console.log('📊 Submitting weekly shifts:', {
      shiftsCount: validShifts.length,
      employeeId: tokenData.employee_id,
      employeeName: `${tokenData.employee.first_name} ${tokenData.employee.last_name}`,
      weekStart: tokenData.week_start_date,
      weekEnd: tokenData.week_end_date
    });

    setSubmitting(true);
    try {
      const submissionData: WeeklySubmissionData = {
        shifts: validShifts,
        week_start_date: tokenData.week_start_date,
        week_end_date: tokenData.week_end_date,
        notes,
      };

      await WeeklyShiftService.submitWeeklyShifts(token, submissionData);
      
      console.log('✅ Weekly shifts submitted successfully');
      
      toast({
        title: 'הצלחה!',
        description: `${validShifts.length} משמרות נשלחו בהצלחה עבור ${tokenData.employee.first_name} ${tokenData.employee.last_name}`,
      });
      navigate('/shift-submitted');
    } catch (error: any) {
      console.error('💥 Weekly shifts submission error:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בשליחת משמרות השבוע',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">שגיאה בטעינת הנתונים</h2>
            <p className="text-gray-600">לא ניתן לטעון את פרטי המשתמש או הטוקן</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              הגשת משמרות שבועיות
            </CardTitle>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  {tokenData.employee?.first_name} {tokenData.employee?.last_name}
                </span>
                {tokenData.employee?.employee_id && (
                  <span className="text-sm">
                    (מס' עובד: {tokenData.employee.employee_id})
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  שבוע: {formatDate(tokenData.week_start_date)} - {formatDate(tokenData.week_end_date)}
                </span>
              </div>
              {tokenData.employee?.phone && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span>טלפון: {tokenData.employee.phone}</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">משמרות השבוע</h3>
                  <Button
                    type="button"
                    onClick={addShift}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    הוסף משמרת
                  </Button>
                </div>

                {shifts.map((shift, index) => (
                  <Card key={index} className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">משמרת {index + 1}</h4>
                      {shifts.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeShift(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`date-${index}`} className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          תאריך
                        </Label>
                        <Input
                          id={`date-${index}`}
                          type="date"
                          value={shift.date}
                          onChange={(e) => updateShift(index, 'date', e.target.value)}
                          min={tokenData.week_start_date}
                          max={tokenData.week_end_date}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor={`branch-${index}`} className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          העדפת סניף
                        </Label>
                        <Input
                          id={`branch-${index}`}
                          placeholder="שם הסניף"
                          value={shift.branch_preference}
                          onChange={(e) => updateShift(index, 'branch_preference', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor={`start-time-${index}`} className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          שעת התחלה
                        </Label>
                        <Input
                          id={`start-time-${index}`}
                          type="time"
                          value={shift.start_time}
                          onChange={(e) => updateShift(index, 'start_time', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor={`end-time-${index}`} className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          שעת סיום
                        </Label>
                        <Input
                          id={`end-time-${index}`}
                          type="time"
                          value={shift.end_time}
                          onChange={(e) => updateShift(index, 'end_time', e.target.value)}
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor={`role-${index}`}>העדפת תפקיד (אופציונלי)</Label>
                        <Input
                          id={`role-${index}`}
                          placeholder="התפקיד המועדף"
                          value={shift.role_preference || ''}
                          onChange={(e) => updateShift(index, 'role_preference', e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor={`shift-notes-${index}`}>הערות למשמרת (אופציונלי)</Label>
                        <Textarea
                          id={`shift-notes-${index}`}
                          placeholder="הערות למשמרת זו"
                          value={shift.notes || ''}
                          onChange={(e) => updateShift(index, 'notes', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div>
                <Label htmlFor="general-notes">הערות כלליות (אופציונלי)</Label>
                <Textarea
                  id="general-notes"
                  placeholder="הערות כלליות לשבוע"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>שימו לב:</strong> לאחר שליחת הבקשה לא ניתן יהיה לערוך אותה. 
                  אנא ודאו שכל הפרטים נכונים לפני השליחה.
                </p>
                {tokenData.employee && (
                  <p className="text-xs text-yellow-700 mt-2">
                    הבקשה תישלח עבור: {tokenData.employee.first_name} {tokenData.employee.last_name}
                    {tokenData.employee.employee_id && ` (מס' עובד: ${tokenData.employee.employee_id})`}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={submitting}
              >
                {submitting ? 'שולח...' : 'שלח משמרות השבוע'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
