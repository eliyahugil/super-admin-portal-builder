import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { usePublicShifts } from '@/hooks/usePublicShifts';
import { PublicShiftForm, ShiftPreference } from '@/types/publicShift';
import { format, startOfWeek, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Calendar, Clock, User } from 'lucide-react';

const PublicShiftSubmission: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { useToken, submitShifts } = usePublicShifts();
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useToken(token || '');
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  const [formData, setFormData] = useState<PublicShiftForm>({
    employee_name: '',
    phone: '',
    preferences: [],
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  // Load employee data when token data is available
  useEffect(() => {
    const loadEmployeeData = async () => {
      if (tokenData?.employee_id) {
        setEmployeeLoading(true);
        try {
          const { data: employee, error } = await supabase
            .from('employees')
            .select('*, employee_branch_assignments(*), employee_default_preferences(*)')
            .eq('id', tokenData.employee_id)
            .single();

          if (error) {
            console.error('Error loading employee data:', error);
            return;
          }

          setEmployeeData(employee);
          // Auto-fill employee data
          setFormData(prev => ({
            ...prev,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            phone: employee.phone || '',
          }));
        } catch (error) {
          console.error('Error loading employee data:', error);
        } finally {
          setEmployeeLoading(false);
        }
      }
    };

    loadEmployeeData();
  }, [tokenData]);

  // Generate available shifts based on employee type and preferences
  const getAvailableShifts = () => {
    const shifts: ShiftPreference[] = [];
    
    if (!tokenData || !employeeData) return shifts;
    
    // Get employee preferences and restrictions
    const employeeType = employeeData?.employee_type?.toLowerCase() || 'כללי';
    const preferences = employeeData?.employee_default_preferences?.[0];
    
    // Define shift types based on employee type
    let allowedShiftTypes: string[] = [];
    if (employeeType.includes('בוקר') || employeeType.includes('morning')) {
      allowedShiftTypes = ['morning'];
    } else if (employeeType.includes('ערב') || employeeType.includes('evening')) {
      allowedShiftTypes = ['evening'];
    } else if (employeeType.includes('לילה') || employeeType.includes('night')) {
      allowedShiftTypes = ['night'];
    } else {
      // Default for general employees
      allowedShiftTypes = ['morning', 'evening'];
    }

    // Use employee preferences if available, otherwise use defaults
    const availableDays = preferences?.available_days || [0, 1, 2, 3, 4, 5, 6];
    const employeeShiftTypes = preferences?.shift_types || allowedShiftTypes;
    
    // Filter shift types based on employee type
    const finalShiftTypes = employeeShiftTypes.filter(type => allowedShiftTypes.includes(type));

    // Generate shifts for each day and allowed shift type
    for (let day = 0; day < 7; day++) {
      if (availableDays.includes(day)) {
        finalShiftTypes.forEach(shiftType => {
          const shiftTimes = getShiftTimes(shiftType);
          shifts.push({
            day_of_week: day,
            shift_type: shiftType as any,
            start_time: shiftTimes.start,
            end_time: shiftTimes.end,
            available: false, // Default to not available, user will select
          });
        });
      }
    }

    return shifts;
  };

  const getShiftTimes = (shiftType: string) => {
    switch (shiftType) {
      case 'morning':
        return { start: '06:00', end: '14:00' };
      case 'afternoon':
        return { start: '14:00', end: '22:00' };
      case 'evening':
        return { start: '14:00', end: '22:00' };
      case 'night':
        return { start: '22:00', end: '06:00' };
      default:
        return { start: '09:00', end: '17:00' };
    }
  };

  const handleShiftToggle = (shift: ShiftPreference, available: boolean) => {
    setFormData(prev => {
      const newPreferences = prev.preferences.filter(
        p => !(p.day_of_week === shift.day_of_week && p.shift_type === shift.shift_type)
      );

      if (available) {
        newPreferences.push({
          ...shift,
          available: true,
        });
      }

      return { ...prev, preferences: newPreferences };
    });
  };

  const availableShifts = tokenData && employeeData ? getAvailableShifts() : [];

  const getDayName = (day: number) => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[day];
  };

  const getShiftTypeName = (type: string) => {
    const types = {
      morning: 'בוקר',
      afternoon: 'צהריים',
      evening: 'ערב', 
      night: 'לילה'
    };
    return types[type as keyof typeof types] || type;
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

  if (tokenLoading || employeeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>טוען נתונים...</p>
        </div>
      </div>
    );
  }

  const isTokenValid = tokenData && 
    new Date(tokenData.expires_at) > new Date() &&
    tokenData.is_active;

  if (tokenError || !isTokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
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

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">הגשת משמרות אישית</h1>
            {employeeData && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-semibold text-blue-900">
                  שלום {employeeData.first_name} {employeeData.last_name}!
                </h2>
                <p className="text-sm text-blue-700">
                  סוג עובד: {employeeData.employee_type || 'עובד כללי'}
                </p>
                <p className="text-sm text-blue-600">
                  שבוע {format(new Date(tokenData.week_start_date), 'd/M')} - {format(new Date(tokenData.week_end_date), 'd/M')}
                </p>
              </div>
            )}
            <p className="text-gray-600">
              אנא בחר את המשמרות המתאימות לך לשבוע זה
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="employee_name">שם מלא</Label>
                <Input
                  id="employee_name"
                  value={formData.employee_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                  placeholder="הכנס את שמך המלא"
                  required
                  disabled={!!employeeData} // Disable if loaded from employee data
                />
              </div>

              <div>
                <Label htmlFor="phone">מספר טלפון</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="הכנס מספר טלפון"
                  disabled={!!employeeData} // Disable if loaded from employee data
                />
              </div>

              <div>
                <Label>בחירת משמרות</Label>
                {availableShifts.length > 0 ? (
                  <div className="space-y-3 mt-2">
                    <p className="text-sm text-gray-600">
                      המשמרות המוצגות מותאמות לסוג העובד שלך. אנא בחר את המשמרות שאתה זמין להן:
                    </p>
                    <div className="grid gap-3">
                      {availableShifts.map((shift, index) => {
                        const currentPreference = formData.preferences.find(
                          p => p.day_of_week === shift.day_of_week && p.shift_type === shift.shift_type
                        );
                        
                        return (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">
                                  {getDayName(shift.day_of_week)} - {getShiftTypeName(shift.shift_type)}
                                </span>
                                <div className="text-sm text-gray-600">
                                  {shift.start_time} - {shift.end_time}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={currentPreference?.available ? "default" : "outline"}
                                  onClick={() => handleShiftToggle(shift, true)}
                                >
                                  זמין
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={currentPreference?.available === false ? "destructive" : "outline"}
                                  onClick={() => handleShiftToggle(shift, false)}
                                >
                                  לא זמין
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    אין משמרות זמינות עבור סוג העובד שלך השבוע.
                  </p>
                )}
              </div>

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
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={submitShifts.isPending || availableShifts.length === 0}
                className="w-full"
              >
                {submitShifts.isPending ? 'שולח...' : 'שלח הגשה'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicShiftSubmission;