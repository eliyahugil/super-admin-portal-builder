import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { usePublicShifts } from '@/hooks/usePublicShifts';
import { PublicShiftForm, ShiftPreference } from '@/types/publicShift';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 0, label: 'ראשון' },
  { value: 1, label: 'שני' },
  { value: 2, label: 'שלישי' },
  { value: 3, label: 'רביעי' },
  { value: 4, label: 'חמישי' },
  { value: 5, label: 'שישי' },
  { value: 6, label: 'שבת' },
];

const SHIFT_TYPES = [
  { value: 'morning', label: 'בוקר', time: '06:00-14:00' },
  { value: 'afternoon', label: 'צהריים', time: '14:00-22:00' },
  { value: 'evening', label: 'ערב', time: '18:00-02:00' },
  { value: 'night', label: 'לילה', time: '22:00-06:00' },
];

const PublicShiftSubmission: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { useToken, submitShifts } = usePublicShifts();
  
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useToken(token || '');
  
  const [formData, setFormData] = useState<PublicShiftForm>({
    employee_name: '',
    phone: '',
    preferences: [],
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const isTokenValid = tokenData && 
    new Date(tokenData.expires_at) > new Date() &&
    tokenData.is_active;

  const handlePreferenceChange = (
    dayOfWeek: number,
    shiftType: 'morning' | 'afternoon' | 'evening' | 'night',
    available: boolean
  ) => {
    const shiftInfo = SHIFT_TYPES.find(s => s.value === shiftType);
    const [startTime, endTime] = shiftInfo?.time.split('-') || ['', ''];

    setFormData(prev => {
      const newPreferences = prev.preferences.filter(
        p => !(p.day_of_week === dayOfWeek && p.shift_type === shiftType)
      );

      if (available) {
        newPreferences.push({
          day_of_week: dayOfWeek,
          shift_type: shiftType,
          start_time: startTime,
          end_time: endTime,
          available: true,
        });
      }

      return { ...prev, preferences: newPreferences };
    });
  };

  const isPreferenceSelected = (dayOfWeek: number, shiftType: string) => {
    return formData.preferences.some(
      p => p.day_of_week === dayOfWeek && p.shift_type === shiftType && p.available
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenData) return;

    if (!formData.employee_name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'יש להזין שם מלא',
        variant: 'destructive',
      });
      return;
    }

    if (formData.preferences.length === 0) {
      toast({
        title: 'שגיאה', 
        description: 'יש לבחור לפחות משמרת אחת',
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitShifts.mutateAsync({
        tokenId: tokenData.id,
        formData,
      });

      setSubmitted(true);
      toast({
        title: 'הגשה בוצעה בהצלחה!',
        description: 'המשמרות שלך נשלחו לאישור',
      });
    } catch (error) {
      console.error('Error submitting shifts:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בשליחת המשמרות',
        variant: 'destructive',
      });
    }
  };

  if (tokenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (tokenError || !isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center text-center p-6">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-xl font-bold mb-2">קישור לא תקף</h1>
            <p className="text-gray-600">
              הקישור פג תוקף או אינו תקף. אנא פנה למנהל המשמרות.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center text-center p-6">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-xl font-bold mb-2">ההגשה בוצעה בהצלחה!</h1>
            <p className="text-gray-600">
              המשמרות שלך נשלחו לאישור. תקבל עדכון בהקדם.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weekStart = new Date(tokenData.week_start_date);
  const weekEnd = new Date(tokenData.week_end_date);

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">הגשת משמרות</CardTitle>
            <p className="text-center text-gray-600">
              שבוע {weekStart.toLocaleDateString('he-IL')} - {weekEnd.toLocaleDateString('he-IL')}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employee_name">שם מלא *</Label>
                  <Input
                    id="employee_name"
                    value={formData.employee_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                    placeholder="הזן שם מלא"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">טלפון</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="מספר טלפון"
                  />
                </div>
              </div>

              {/* Shift Preferences Grid */}
              <div>
                <Label className="text-lg font-medium">בחר משמרות זמינות</Label>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-right">יום</th>
                        {SHIFT_TYPES.map(shift => (
                          <th key={shift.value} className="border border-gray-300 p-2 text-center">
                            <div className="text-sm font-medium">{shift.label}</div>
                            <div className="text-xs text-gray-600">{shift.time}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS_OF_WEEK.map(day => (
                        <tr key={day.value}>
                          <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                            {day.label}
                          </td>
                          {SHIFT_TYPES.map(shift => (
                            <td key={shift.value} className="border border-gray-300 p-3 text-center">
                              <Checkbox
                                checked={isPreferenceSelected(day.value, shift.value)}
                                onCheckedChange={(checked) => 
                                  handlePreferenceChange(
                                    day.value,
                                    shift.value as any,
                                    checked as boolean
                                  )
                                }
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">הערות נוספות</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="הערות או בקשות מיוחדות..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={submitShifts.isPending}
                  className="w-full sm:w-auto"
                >
                  {submitShifts.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      שולח...
                    </>
                  ) : (
                    'שלח הגשה'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicShiftSubmission;