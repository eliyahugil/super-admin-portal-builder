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
  const [scheduledShifts, setScheduledShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);

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

  // Load scheduled shifts for the token's date range
  useEffect(() => {
    const loadScheduledShifts = async () => {
      if (!tokenData?.business_id || !tokenData?.week_start_date || !tokenData?.week_end_date || !employeeData) return;
      
      setShiftsLoading(true);
      try {
        const { data: shifts, error } = await supabase
          .from('scheduled_shifts')
          .select(`
            id,
            shift_date,
            start_time,
            end_time,
            role,
            employee_id,
            branch_id,
            status,
            branch:branches(id, name)
          `)
          .eq('business_id', tokenData.business_id)
          .gte('shift_date', tokenData.week_start_date)
          .lte('shift_date', tokenData.week_end_date)
          .eq('is_archived', false)
          .is('employee_id', null) // Only unassigned shifts
          .order('shift_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) {
          console.error('Error loading scheduled shifts:', error);
          return;
        }

        // Helper function to determine shift type based on start time
        const getShiftTypeFromTime = (startTime: string) => {
          const hour = parseInt(startTime.split(':')[0]);
          if (hour >= 6 && hour < 12) return 'morning';
          if (hour >= 12 && hour < 17) return 'afternoon';
          if (hour >= 17 && hour < 22) return 'evening';
          return 'night';
        };

        // Filter shifts based on employee's branch assignments and shift type preferences
        let filteredShifts = shifts || [];
        
        if (employeeData.employee_branch_assignments && employeeData.employee_branch_assignments.length > 0) {
          // Get employee's assigned branch IDs
          const assignedBranchIds = employeeData.employee_branch_assignments
            .filter(assignment => assignment.is_active)
            .map(assignment => assignment.branch_id);
          
          // Get employee's preferred shift types from assignments
          const preferredShiftTypes = employeeData.employee_branch_assignments
            .filter(assignment => assignment.is_active && assignment.shift_types)
            .flatMap(assignment => assignment.shift_types || []);
          
          // Filter shifts by assigned branches
          if (assignedBranchIds.length > 0) {
            filteredShifts = filteredShifts.filter(shift => 
              assignedBranchIds.includes(shift.branch_id)
            );
          }
          
          // Filter shifts by preferred shift types if available
          if (preferredShiftTypes.length > 0) {
            filteredShifts = filteredShifts.filter(shift => {
              const shiftType = getShiftTypeFromTime(shift.start_time);
              return preferredShiftTypes.includes(shiftType);
            });
          }
        } else if (employeeData.employee_default_preferences && employeeData.employee_default_preferences.length > 0) {
          // Fallback to default preferences if no branch assignments
          const defaultPrefs = employeeData.employee_default_preferences[0];
          if (defaultPrefs.shift_types && defaultPrefs.shift_types.length > 0) {
            filteredShifts = filteredShifts.filter(shift => {
              const shiftType = getShiftTypeFromTime(shift.start_time);
              return defaultPrefs.shift_types.includes(shiftType);
            });
          }
        }

        console.log('📊 Loaded scheduled shifts for token:', shifts?.length || 0);
        console.log('📊 All shifts details:', shifts?.map(s => ({
          id: s.id, 
          date: s.shift_date, 
          time: `${s.start_time}-${s.end_time}`, 
          status: s.status,
          employee_id: s.employee_id,
          role: s.role,
          branch: s.branch?.name
        })));
        console.log('📊 Filtered shifts for employee:', filteredShifts.length);
        console.log('📊 Final filtered shifts:', filteredShifts);
        setScheduledShifts(filteredShifts);
      } catch (error) {
        console.error('Error loading scheduled shifts:', error);
      } finally {
        setShiftsLoading(false);
      }
    };

    loadScheduledShifts();
  }, [tokenData, employeeData]);

  const handleShiftToggle = (shift: any, available: boolean) => {
    setFormData(prev => {
      const newPreferences = prev.preferences.filter(
        (p: any) => p.shift_id !== shift.id
      );

      if (available) {
        newPreferences.push({
          shift_id: shift.id,
          shift_date: shift.shift_date,
          start_time: shift.start_time,
          end_time: shift.end_time,
          role: shift.role,
          branch_name: shift.branch?.name,
          available: true,
        });
      }

      return { ...prev, preferences: newPreferences };
    });
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[date.getDay()];
  };

  const getDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
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

  if (tokenLoading || employeeLoading || shiftsLoading) {
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
                {scheduledShifts.length > 0 ? (
                  <div className="space-y-3 mt-2">
                    <p className="text-sm text-gray-600">
                      המשמרות הבאות זמינות להגשה עבור השבוע שנבחר. אנא בחר את המשמרות שאתה מעוניין לעבד:
                    </p>
                    <div className="grid gap-3">
                      {scheduledShifts.map((shift, index) => {
                        const currentPreference = formData.preferences.find(
                          (p: any) => p.shift_id === shift.id
                        );
                        
                        return (
                          <div key={shift.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="font-medium text-lg">
                                  {getDayName(shift.shift_date)} {getDateDisplay(shift.shift_date)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {shift.start_time} - {shift.end_time}
                                </div>
                                {shift.branch?.name && (
                                  <div className="text-sm text-blue-600 font-medium">
                                    📍 {shift.branch.name}
                                  </div>
                                )}
                                {shift.role && (
                                  <div className="text-sm text-gray-500">
                                    תפקיד: {shift.role}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={currentPreference?.available ? "default" : "outline"}
                                  onClick={() => handleShiftToggle(shift, true)}
                                >
                                  מעוניין
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={currentPreference && !currentPreference.available ? "destructive" : "outline"}
                                  onClick={() => handleShiftToggle(shift, false)}
                                >
                                  לא מעוניין
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
                    אין משמרות פנויות להגשה בשבוע זה.
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
                disabled={submitShifts.isPending || scheduledShifts.length === 0}
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