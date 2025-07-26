
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePublicShifts } from '@/hooks/usePublicShifts';
import { PublicShiftForm, ShiftPreference } from '@/types/publicShift';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, User, Send, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScheduledShift {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  branch_id: string;
  branch_name?: string;
  role?: string;
  notes?: string;
  is_assigned: boolean;
  employee_id?: string;
  status: string;
}

export const PublicShiftSubmission: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { useToken, submitShifts } = usePublicShifts();
  
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useToken(token || '');
  
  const [formData, setFormData] = useState<PublicShiftForm>({
    employee_name: '',
    phone: '',
    preferences: [],
    notes: ''
  });
  
  const [scheduledShifts, setScheduledShifts] = useState<ScheduledShift[]>([]);
  const [allScheduledShifts, setAllScheduledShifts] = useState<ScheduledShift[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);

  // Load employee data and shifts when token is available
  useEffect(() => {
    if (!tokenData) return;

    console.log('🔍 Token data loaded:', tokenData);
    
    const loadEmployeeData = async () => {
      try {
        const { data: employee, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', tokenData.employee_id)
          .single();

        if (error) {
          console.error('❌ Error loading employee data:', error);
          return;
        }

        console.log('✅ Employee data loaded:', employee);
        setEmployeeData(employee);
        
        // Pre-fill form with employee data
        setFormData(prev => ({
          ...prev,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          phone: employee.phone || ''
        }));
      } catch (error) {
        console.error('❌ Error in loadEmployeeData:', error);
      }
    };

    const loadScheduledShifts = async () => {
      if (!tokenData.business_id || !tokenData.week_start_date || !tokenData.week_end_date) {
        console.warn('⚠️ Missing required token data for loading shifts');
        return;
      }

      setShiftsLoading(true);
      try {
        console.log('🔍 Loading shifts for week:', tokenData.week_start_date, 'to', tokenData.week_end_date);
        
        const { data: shifts, error } = await supabase
          .from('scheduled_shifts')
          .select(`
            *,
            branches (
              id,
              name
            )
          `)
          .eq('business_id', tokenData.business_id)
          .gte('shift_date', tokenData.week_start_date)
          .lte('shift_date', tokenData.week_end_date)
          .order('shift_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) {
          console.error('❌ Error loading shifts:', error);
          toast({
            title: "שגיאה",
            description: "שגיאה בטעינת המשמרות הזמינות",
            variant: "destructive"
          });
          return;
        }

        console.log('✅ Shifts loaded:', shifts?.length || 0);
        
        // Add branch_name to shifts
        const shiftsWithBranchInfo = shifts?.map(shift => ({
          ...shift,
          branch_name: shift.branches?.name || 'לא צוין'
        })) || [];

        // Store all shifts and filtered shifts separately
        setAllScheduledShifts(shifts || []);
        setScheduledShifts(shiftsWithBranchInfo);
        } catch (error) {
          console.error('❌ Error loading scheduled shifts:', error);
        } finally {
          setShiftsLoading(false);
        }
      }
    };

    loadEmployeeData();
    loadScheduledShifts();
  }, [tokenData, toast]);

  const getShiftTypeFromTime = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 24) return 'evening';
    return 'night';
  };

  // Group shifts by date for better UI organization
  const shiftsByDate = useMemo(() => {
    const grouped = scheduledShifts.reduce((acc, shift) => {
      const date = shift.shift_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(shift);
      return acc;
    }, {} as Record<string, ScheduledShift[]>);

    // Sort dates
    const sortedDates = Object.keys(grouped).sort();
    const result: Record<string, ScheduledShift[]> = {};
    sortedDates.forEach(date => {
      result[date] = grouped[date];
    });
    
    return result;
  }, [scheduledShifts]);

  const handleShiftToggle = (shift: ScheduledShift, isSelected: boolean) => {
    console.log('🔄 Toggle shift:', shift.id, 'Selected:', isSelected);
    
    setFormData(prev => {
      let newPreferences = [...prev.preferences];
      
      if (isSelected) {
        // Add shift preference
        const newPreference: ShiftPreference = {
          shift_id: shift.id,
          shift_date: shift.shift_date,
          start_time: shift.start_time,
          end_time: shift.end_time,
          role: shift.role || '',
          branch_name: shift.branch_name || '',
          available: true
        };
        newPreferences.push(newPreference);
        console.log('✅ Added shift preference:', newPreference);
      } else {
        // Remove shift preference
        newPreferences = newPreferences.filter(pref => pref.shift_id !== shift.id);
        console.log('❌ Removed shift preference for shift:', shift.id);
      }
      
      return { ...prev, preferences: newPreferences };
    });
  };

  const isShiftSelected = (shiftId: string) => {
    return formData.preferences.some(pref => pref.shift_id === shiftId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "שגיאה",
        description: "טוקן לא תקף",
        variant: "destructive"
      });
      return;
    }

    if (formData.preferences.length === 0) {
      toast({
        title: "שגיאה", 
        description: "אנא בחר לפחות משמרת אחת",
        variant: "destructive"
      });
      return;
    }

    console.log('📤 Submitting form data:', {
      preferences: formData.preferences.length,
      notes: formData.notes?.length || 0
    });

    try {
      await submitShifts.mutateAsync({
        token: token,
        formData
      });
      
      toast({
        title: "הצלחה!",
        description: `הגשת בחירת המשמרות בוצעה בהצלחה. נבחרו ${formData.preferences.length} משמרות.`,
        variant: "default"
      });
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        preferences: [],
        notes: ''
      }));
      
    } catch (error: any) {
      console.error('❌ Submission error:', error);
      toast({
        title: "שגיאה בהגשה",
        description: error.message || "שגיאה לא ידועה בהגשת המשמרות",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, d MMMM yyyy', { locale: he });
    } catch (error) {
      return dateString;
    }
  };

  const getDayOfWeek = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE', { locale: he });
    } catch (error) {
      return '';
    }
  };

  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (tokenError || !tokenData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">שגיאה</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              הטוקן לא תקף או פג תוקף. אנא פנה למנהל לקבלת טוקן חדש.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              הגשת בחירת משמרות
            </CardTitle>
            <CardDescription>
              {employeeData ? `שלום ${employeeData.first_name} ${employeeData.last_name}` : 'שלום'}
              <br />
              בחר את המשמרות שאתה מעוניין לעבוד בהן השבוע
            </CardDescription>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shifts Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                בחירת משמרות
              </CardTitle>
              <CardDescription>
                בחר את המשמרות שאתה מעוניין לעבוד בהן
              </CardDescription>
            </CardHeader>
            <CardContent>
              {shiftsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">טוען משמרות...</p>
                </div>
              ) : Object.keys(shiftsByDate).length === 0 ? (
                <Alert>
                  <AlertDescription>
                    לא נמצאו משמרות זמינות לשבוע זה
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {Object.entries(shiftsByDate).map(([date, shifts]) => (
                    <div key={date} className="space-y-3">
                      {/* Day Header */}
                      <div className="border-b pb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {getDayOfWeek(date)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(date)}
                        </p>
                      </div>
                      
                      {/* Shifts for this day */}
                      <div className="grid gap-3 md:grid-cols-2">
                        {shifts.map((shift) => (
                          <div
                            key={shift.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              isShiftSelected(shift.id)
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handleShiftToggle(shift, !isShiftSelected(shift.id))}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {shift.start_time} - {shift.end_time}
                                </span>
                              </div>
                              {isShiftSelected(shift.id) && (
                                <CheckCircle className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{shift.branch_name}</span>
                              </div>
                              
                              {shift.role && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  <span>{shift.role}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={getShiftTypeFromTime(shift.start_time) === 'morning' ? 'default' : 'secondary'}>
                                  {getShiftTypeFromTime(shift.start_time) === 'morning' ? 'בוקר' : 
                                   getShiftTypeFromTime(shift.start_time) === 'afternoon' ? 'צהריים' : 
                                   getShiftTypeFromTime(shift.start_time) === 'evening' ? 'ערב' : 'לילה'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>הערות נוספות</CardTitle>
              <CardDescription>
                הערות או בקשות מיוחדות (אופציונלי)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="הכנס הערות או בקשות מיוחדות..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {formData.preferences.length > 0 && (
                    <span>נבחרו {formData.preferences.length} משמרות</span>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={formData.preferences.length === 0 || submitShifts.isPending}
                  className="px-8"
                >
                  {submitShifts.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      שולח...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      שלח הגשה
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default PublicShiftSubmission;
