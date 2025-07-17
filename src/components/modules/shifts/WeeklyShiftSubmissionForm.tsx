import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyShiftService, ShiftEntry, WeeklySubmissionData } from '@/services/WeeklyShiftService';
import { ShiftCalendarView } from './ShiftCalendarView';
import { Clock, MapPin, User, Calendar, Plus, Trash2, AlertTriangle, Copy, LogIn } from 'lucide-react';

export const WeeklyShiftSubmissionForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  // Get available shifts from the context
  const [availableShifts, setAvailableShifts] = useState<any[]>([]);
  // Selected shifts by employee (shift ID -> selected)
  const [selectedShifts, setSelectedShifts] = useState<Record<string, boolean>>({});
  // Optional morning shifts preference
  const [optionalMorningShifts, setOptionalMorningShifts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const validateTokenAndGetContext = async () => {
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
        console.log('🔍 Getting weekly shifts context for token:', token);
        
        // Use the edge function to get both token validation and shifts context
        const { data: contextData, error: contextError } = await supabase.functions.invoke('get-weekly-shifts-context', {
          body: { token }
        });

        if (contextError) {
          console.error('❌ Context error:', contextError);
          toast({
            title: 'שגיאה',
            description: 'שגיאה בקבלת נתוני הטוקן',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        if (!contextData?.success) {
          console.error('❌ Context validation failed');
          toast({
            title: 'טוקן לא תקף',
            description: 'הטוקן פג תוקף או כבר נוצל',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        console.log('✅ Context retrieved successfully:', contextData);

        // Extract token data and shifts
        const { tokenData: validatedTokenData, context, shifts } = contextData;

        // Validate that we have all required employee data
        if (!validatedTokenData.employee || !validatedTokenData.employee.first_name || !validatedTokenData.employee.last_name) {
          console.error('❌ Missing employee data:', validatedTokenData.employee);
          toast({
            title: 'שגיאה בנתוני המשתמש',
            description: 'חסרים פרטי עובד. אנא פנה למנהל המערכת.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        console.log('✅ Token and context validated successfully:', {
          employeeId: validatedTokenData.employeeId,
          employeeName: `${validatedTokenData.employee.first_name} ${validatedTokenData.employee.last_name}`,
          employeeIdNumber: validatedTokenData.employee.employee_id,
          weekStart: validatedTokenData.weekStart,
          weekEnd: validatedTokenData.weekEnd,
          contextType: context.type,
          shiftsCount: shifts.length
        });

        setTokenData(validatedTokenData);

        // Check if we're in submission mode (available shifts) or view mode (assigned shifts)
        if (context.type === 'available_shifts') {
          console.log('📋 Available shifts mode - employee can submit preferences');
          setAvailableShifts(shifts || []);
        } else {
          console.log('👀 Assigned shifts mode - showing employee their assignments');
          // For assigned shifts, we don't allow submission but show the assignments
          setAvailableShifts(shifts || []);
          toast({
            title: 'המשמרות כבר פורסמו',
            description: 'אתה יכול לראות את המשמרות שהוקצו לך לשבוע זה',
          });
        }
        
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

    validateTokenAndGetContext();
  }, [token, navigate, toast]);

  // Toggle shift selection with automatic additional shifts
  const toggleShiftSelection = (shiftId: string) => {
    const isCurrentlySelected = selectedShifts[shiftId];
    
    if (!isCurrentlySelected) {
      // אם בוחרים משמרת - לבחור גם משמרות נוספות אוטומטית
      const selectedShift = availableShifts.find(s => s.id === shiftId);
      if (selectedShift) {
        const additionalShifts = findAdditionalShifts(selectedShift);
        
        setSelectedShifts(prev => {
          const newSelection = { ...prev, [shiftId]: true };
          
          // הוספת משמרות נוספות
          additionalShifts.forEach(shift => {
            newSelection[shift.id] = true;
          });
          
          return newSelection;
        });
        
        // הודעה למשתמש על משמרות נוספות שנבחרו
        if (additionalShifts.length > 0) {
          toast({
            title: 'משמרות נוספות נבחרו אוטומטית! 🎯',
            description: `נבחרו ${additionalShifts.length} משמרות נוספות באותו יום שאתה יכול לעבוד`,
          });
        }
      }
    } else {
      // אם מבטלים בחירת משמרת - רק לבטל את המשמרת הזו
      setSelectedShifts(prev => ({
        ...prev,
        [shiftId]: false
      }));
    }
  };

  // פונקציה לחיפוש משמרות נוספות באותו יום שהעובד יכול לעבוד בהן
  const findAdditionalShifts = (selectedShift: any) => {
    // For available_shifts, we need to compare by day_of_week and week
    const sameDayOfWeek = selectedShift.day_of_week;
    const sameWeek = selectedShift.week_start_date;
    const selectedStartTime = selectedShift.start_time;
    const selectedEndTime = selectedShift.end_time;
    
    // המרת זמן לדקות לצורך השוואה
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const selectedStartMinutes = timeToMinutes(selectedStartTime);
    const selectedEndMinutes = timeToMinutes(selectedEndTime);
    
    // חיפוש משמרות נוספות באותו יום שהזמנים שלהן נכנסים בזמנים של המשמרת שנבחרה
    return availableShifts.filter(shift => {
      if (shift.day_of_week !== sameDayOfWeek || 
          shift.week_start_date !== sameWeek || 
          shift.id === selectedShift.id) {
        return false;
      }
      
      const shiftStartMinutes = timeToMinutes(shift.start_time);
      const shiftEndMinutes = timeToMinutes(shift.end_time);
      
      // בדיקה אם המשמרת נכנסת בזמנים של המשמרת שנבחרה
      return shiftStartMinutes >= selectedStartMinutes && shiftEndMinutes <= selectedEndMinutes;
    });
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

    // Get selected shifts
    const selectedShiftIds = Object.entries(selectedShifts)
      .filter(([_, isSelected]) => isSelected)
      .map(([shiftId, _]) => shiftId);

    if (selectedShiftIds.length === 0) {
      toast({
        title: 'שגיאה',
        description: 'יש לבחור לפחות משמרת אחת',
        variant: 'destructive',
      });
      return;
    }

    // Convert selected shifts to the expected format
    const validShifts = selectedShiftIds.map(shiftId => {
      const shift = availableShifts.find(s => s.id === shiftId);
      
      // Create shift date from week start and day of week
      const weekStart = new Date(tokenData.weekStart);
      const shiftDate = new Date(weekStart);
      shiftDate.setDate(weekStart.getDate() + shift.day_of_week);
      
      return {
        date: shiftDate.toISOString().split('T')[0],
        start_time: shift.start_time,
        end_time: shift.end_time,
        branch_preference: shift.branch?.name || '',
        role_preference: shift.shift_type || '',
        notes: '',
        available_shift_id: shiftId
      };
    });

    console.log('📊 Submitting weekly shifts:', {
      shiftsCount: validShifts.length,
      employeeId: tokenData.employeeId,
      employeeName: `${tokenData.employee.first_name} ${tokenData.employee.last_name}`,
      weekStart: tokenData.weekStart,
      weekEnd: tokenData.weekEnd
    });

    setSubmitting(true);
    try {
      const submissionData: WeeklySubmissionData = {
        shifts: validShifts,
        week_start_date: tokenData.weekStart,
        week_end_date: tokenData.weekEnd,
        notes,
        optional_morning_availability: Object.entries(optionalMorningShifts)
          .filter(([_, isSelected]) => isSelected)
          .map(([dayIndex, _]) => parseInt(dayIndex))
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

  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-full">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-between items-start mb-4">
              <div></div> {/* Spacer for centering */}
              <CardTitle className="text-2xl font-bold text-gray-900">
                הגשת משמרות לשבוע {formatDate(tokenData.weekStart)} - {formatDate(tokenData.weekEnd)}
              </CardTitle>
              <div className="text-sm text-gray-500">
                {tokenData.employee.business.name}
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                <span className="font-medium">
                  {tokenData.employee.first_name} {tokenData.employee.last_name}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                מספר עובד: {tokenData.employee.employee_id}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {availableShifts.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  אין משמרות זמינות
                </h3>
                <p className="text-gray-600">
                  לא נמצאו משמרות זמינות לשבוע זה
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">בחר משמרות זמינות:</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {availableShifts.map((shift) => (
                      <Card 
                        key={shift.id}
                        className={`cursor-pointer transition-all border-2 ${
                          selectedShifts[shift.id] 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleShiftSelection(shift.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">
                              {daysOfWeek[shift.day_of_week]}
                            </h4>
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {shift.shift_type}
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{shift.start_time} - {shift.end_time}</span>
                            </div>
                            
                            {shift.branch && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span>{shift.branch.name}</span>
                              </div>
                            )}
                            
                            {shift.required_employees && (
                              <div className="text-xs text-gray-600">
                                דרושים: {shift.required_employees} עובדים
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="notes">הערות נוספות (אופציונלי)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="הוסף הערות או בקשות מיוחדות..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={submitting || Object.values(selectedShifts).filter(Boolean).length === 0}
                    className="px-8 py-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        שולח...
                      </>
                    ) : (
                      `שלח בחירת משמרות (${Object.values(selectedShifts).filter(Boolean).length})`
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};