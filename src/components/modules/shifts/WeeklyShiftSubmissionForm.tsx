
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
  
  console.log('🔍 WeeklyShiftSubmissionForm mounted with token:', token);
  console.log('🔍 Current URL:', window.location.href);
  
  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  // Get available shifts from scheduled_shifts table for the token's week
  const [availableShifts, setAvailableShifts] = useState<any[]>([]);
  // Selected shifts by employee (shift ID -> selected)
  const [selectedShifts, setSelectedShifts] = useState<Record<string, boolean>>({});
  // Optional morning shifts preference
  const [optionalMorningShifts, setOptionalMorningShifts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchWeeklyShiftsContext = async () => {
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
        console.log('🔍 Fetching weekly shifts context for token:', token);
        
        // Use the public edge function to get shifts context
        const { data, error } = await supabase.functions.invoke('get-weekly-shifts-context', {
          body: { token }
        });

        if (error || !data?.success) {
          console.error('❌ Failed to get shifts context:', error || data?.error);
          toast({
            title: 'טוקן לא תקף',
            description: 'הטוקן פג תוקף או כבר נוצל',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        const { tokenData: validatedTokenData, shifts, context } = data;

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

        console.log('✅ Shifts context loaded successfully:', {
          employeeId: validatedTokenData.employeeId,
          employeeName: `${validatedTokenData.employee.first_name} ${validatedTokenData.employee.last_name}`,
          shiftsCount: shifts.length,
          contextType: context.type
        });

        // Convert the data to match the expected format
        const formattedTokenData = {
          id: validatedTokenData.id,
          employee_id: validatedTokenData.employeeId,
          week_start_date: validatedTokenData.weekStart,
          week_end_date: validatedTokenData.weekEnd,
          expires_at: validatedTokenData.expiresAt,
          employee: validatedTokenData.employee
        };

        setTokenData(formattedTokenData);
        
        // Transform shifts based on context type
        let transformedShifts = [];
        
        if (context.type === 'assigned_shifts') {
          // For assigned shifts from scheduled_shifts table
          transformedShifts = shifts;
        } else {
          // For available shifts from available_shifts table - convert to scheduled_shifts format
          transformedShifts = shifts.map(shift => ({
            id: shift.id,
            shift_date: getDateFromDayOfWeek(shift.day_of_week, validatedTokenData.weekStart),
            start_time: shift.start_time,
            end_time: shift.end_time,
            status: 'pending',
            business_id: shift.business_id,
            branch_id: shift.branch_id,
            role: shift.shift_name,
            branches: shift.branch
          }));
        }
        
        console.log('📋 Transformed shifts:', {
          originalCount: shifts.length,
          transformedCount: transformedShifts.length,
          contextType: context.type
        });
        
        setAvailableShifts(transformedShifts);

      } catch (error) {
        console.error('💥 Error fetching shifts context:', error);
        toast({
          title: 'שגיאה',
          description: 'שגיאה בטעינת נתוני המשמרות',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyShiftsContext();
  }, [token, navigate, toast]);

  // Helper function to convert day of week to actual date
  const getDateFromDayOfWeek = (dayOfWeek: number, weekStart: string) => {
    const startDate = new Date(weekStart);
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + dayOfWeek);
    return targetDate.toISOString().split('T')[0];
  };

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
    const sameDate = selectedShift.shift_date;
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
      if (shift.shift_date !== sameDate || shift.id === selectedShift.id) {
        return false;
      }
      
      const shiftStartMinutes = timeToMinutes(shift.start_time);
      const shiftEndMinutes = timeToMinutes(shift.end_time);
      
      // בדיקה אם המשמרת נכנסת בזמנים של המשמרת שנבחרה
      // המשמרת צריכה להתחיל אחרי או בזמן ההתחלה של המשמרת שנבחרה
      // ולהסתיים לפני או בזמן הסיום של המשמרת שנבחרה
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
      return {
        date: shift.shift_date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        branch_preference: shift.branches?.name || '',
        role_preference: shift.role || '',
        notes: '',
        scheduled_shift_id: shiftId
      };
    });

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

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-full">
        <Card className="w-full">{/* הסרתי את max-w-4xl והוספתי max-w-full */}
          <CardHeader className="text-center">
            <div className="flex justify-between items-start mb-4">
              <div></div> {/* Spacer for centering */}
              <CardTitle className="text-2xl font-bold text-gray-900">
                הגשת משמרות שבועיות
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2 text-sm"
              >
                <LogIn className="h-4 w-4" />
                התחבר למערכת
              </Button>
            </div>
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
            {availableShifts.length > 0 ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <strong>נמצאו {availableShifts.length} משמרות זמינות לשבוע זה!</strong>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    בחר את המשמרות שאתה מעוניין לקחת מלוח השנה למטה
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <ShiftCalendarView
                    shifts={availableShifts}
                    selectedShifts={selectedShifts}
                    onToggleShift={toggleShiftSelection}
                    weekStartDate={tokenData.week_start_date}
                    weekEndDate={tokenData.week_end_date}
                  />
                   {/* אופציה למשמרות בוקר נוספות - רק לעובדי ערב */}
                   {tokenData.employeeShiftTypes?.includes('evening') && !tokenData.employeeShiftTypes?.includes('morning') && (
                     <Card className="bg-blue-50 border-blue-200">
                       <CardHeader className="pb-3">
                         <CardTitle className="text-lg flex items-center gap-2">
                           <Clock className="h-5 w-5 text-blue-600" />
                           זמינות למשמרות בוקר (אופציונלי)
                         </CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                         <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                           <p className="text-sm text-blue-800 font-medium mb-1">
                             💡 מיועד לחופשים ומקרים מיוחדים
                           </p>
                           <p className="text-xs text-blue-700">
                             בנוסף למשמרות הערב הקבועות שלך, תוכל לציין זמינות למשמרות בוקר במידת הצורך.
                             <br />
                             <strong>שימו לב:</strong> משמרות הבוקר אינן מובטחות ותוענקנה רק לפי צורך ובהתאם לזמינות.
                           </p>
                         </div>
                         
                         <div className="space-y-3">
                           <Label className="text-sm font-medium">ימים בהם אני זמין גם למשמרות בוקר:</Label>
                           <div className="grid grid-cols-2 gap-2">
                             {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((day, index) => (
                               <label key={day} className="flex items-center gap-2 p-2 bg-white rounded border hover:bg-blue-50 cursor-pointer">
                                 <input
                                   type="checkbox"
                                   checked={optionalMorningShifts[index.toString()] || false}
                                   onChange={(e) => setOptionalMorningShifts(prev => ({
                                     ...prev,
                                     [index.toString()]: e.target.checked
                                   }))}
                                   className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                                 />
                                 <span className="text-sm">{day}</span>
                               </label>
                             ))}
                           </div>
                         </div>
                         
                         <div className="text-xs text-blue-600 bg-white rounded p-2 border border-blue-200">
                           <strong>הסבר:</strong> סימון ימים כאן מאפשר למנהל לדעת שאתה זמין למשמרות בוקר באותם ימים במידת הצורך. 
                           זה לא מחייב אותך ולא מבטיח שתקבל משמרות בוקר.
                         </div>
                       </CardContent>
                     </Card>
                   )}
                   
                   {/* אופציה למשמרות ערב נוספות - רק לעובדי בוקר */}
                   {tokenData.employeeShiftTypes?.includes('morning') && !tokenData.employeeShiftTypes?.includes('evening') && (
                     <Card className="bg-purple-50 border-purple-200">
                       <CardHeader className="pb-3">
                         <CardTitle className="text-lg flex items-center gap-2">
                           <Clock className="h-5 w-5 text-purple-600" />
                           זמינות למשמרות ערב (אופציונלי)
                         </CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                         <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
                           <p className="text-sm text-purple-800 font-medium mb-1">
                             💡 מיועד לחופשים ומקרים מיוחדים
                           </p>
                           <p className="text-xs text-purple-700">
                             בנוסף למשמרות הבוקר הקבועות שלך, תוכל לציין זמינות למשמרות ערב במידת הצורך.
                             <br />
                             <strong>שימו לב:</strong> משמרות הערב אינן מובטחות ותוענקנה רק לפי צורך ובהתאם לזמינות.
                           </p>
                         </div>
                         
                         <div className="space-y-3">
                           <Label className="text-sm font-medium">ימים בהם אני זמין גם למשמרות ערב:</Label>
                           <div className="grid grid-cols-2 gap-2">
                             {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((day, index) => (
                               <label key={day} className="flex items-center gap-2 p-2 bg-white rounded border hover:bg-purple-50 cursor-pointer">
                                 <input
                                   type="checkbox"
                                   checked={optionalMorningShifts[index.toString()] || false}
                                   onChange={(e) => setOptionalMorningShifts(prev => ({
                                     ...prev,
                                     [index.toString()]: e.target.checked
                                   }))}
                                   className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                 />
                                 <span className="text-sm">{day}</span>
                               </label>
                             ))}
                           </div>
                         </div>
                         
                         <div className="text-xs text-purple-600 bg-white rounded p-2 border border-purple-200">
                           <strong>הסבר:</strong> סימון ימים כאן מאפשר למנהל לדעת שאתה זמין למשמרות ערב באותם ימים במידת הצורך. 
                           זה לא מחייב אותך ולא מבטיח שתקבל משמרות ערב.
                         </div>
                       </CardContent>
                     </Card>
                   )}

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
                      אנא ודאו שכל המשמרות שבחרת נכונות לפני השליחה.
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
                    disabled={submitting || Object.values(selectedShifts).every(s => !s)}
                  >
                    {submitting ? 'שולח...' : `שלח ${Object.values(selectedShifts).filter(s => s).length} משמרות נבחרות`}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                  <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <p className="text-orange-800 font-medium mb-2">
                    לא נמצאו משמרות זמינות לשבוע זה
                  </p>
                  <p className="text-sm text-orange-700">
                    אנא פנה למנהל המערכת להוספת משמרות ללוח הזמנים
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
