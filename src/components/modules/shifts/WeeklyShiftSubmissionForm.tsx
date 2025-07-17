
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

  // Get available shifts from scheduled_shifts table for the token's week
  const [availableShifts, setAvailableShifts] = useState<any[]>([]);
  // Selected shifts by employee (shift ID -> selected)
  const [selectedShifts, setSelectedShifts] = useState<Record<string, boolean>>({});

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
        
        console.log('🔍 Token data:', {
          employeeId: data.employee_id,
          businessId: data.employee.business_id,
          weekStart: data.week_start_date,
          weekEnd: data.week_end_date
        });
        
        // Fetch available shifts for the token's week from scheduled_shifts
        // Filter by employee's business and potentially by their branch assignments
        let shiftsQuery = supabase
          .from('scheduled_shifts')
          .select(`
            id,
            shift_date,
            start_time,
            end_time,
            status,
            business_id,
            branch_id,
            role,
            branches(name, address)
          `)
          .gte('shift_date', data.week_start_date)
          .lte('shift_date', data.week_end_date)
          .eq('status', 'pending')
          .eq('is_archived', false)
          .eq('business_id', data.employee.business_id) // Filter by employee's business
          .order('shift_date')
          .order('start_time');

        // If employee has branch assignments, filter by those branches
        // First, check for branch assignments
        const { data: branchAssignments, error: branchError } = await supabase
          .from('employee_branch_assignments')
          .select('branch_id')
          .eq('employee_id', data.employee_id)
          .eq('is_active', true);

        if (branchError) {
          console.warn('⚠️ Error fetching branch assignments:', branchError);
        }

        console.log('🔍 Branch assignments found:', branchAssignments);

        const assignedBranchIds = branchAssignments?.map(ba => ba.branch_id) || [];
        
        // Filter shifts by employee branch assignments
        if (assignedBranchIds.length > 0) {
          shiftsQuery = shiftsQuery.in('branch_id', assignedBranchIds);
          console.log('🏢 Filtering shifts by employee branch assignments:', assignedBranchIds);
        } else {
          console.log('⚠️ No branch assignments found - showing all business shifts');
        }
        
        console.log('📅 Week dates:', { 
          weekStart: data.week_start_date, 
          weekEnd: data.week_end_date 
        });
        console.log('🏢 Business ID:', data.employee.business_id);

        const { data: shiftsData, error: shiftsError } = await shiftsQuery;

        console.log('🔍 Shifts query params:', {
          weekStart: data.week_start_date,
          weekEnd: data.week_end_date,
          businessId: data.employee.business_id,
          status: 'pending',
          isArchived: false,
          branchFilter: assignedBranchIds.length > 0 ? assignedBranchIds : 'all branches'
        });

        // Let's also check what shifts exist in the database for this business
        const { data: allBusinessShifts, error: allShiftsError } = await supabase
          .from('scheduled_shifts')
          .select('*')
          .eq('business_id', data.employee.business_id);
          
        console.log('🔍 ALL shifts in business (any status, any date):', allBusinessShifts);
        console.log('📊 Total business shifts found:', allBusinessShifts?.length || 0);

        if (shiftsError) {
          console.warn('⚠️ Error fetching available shifts:', shiftsError);
          setAvailableShifts([]);
        } else {
          console.log('📋 Available shifts fetched:', {
            count: shiftsData?.length || 0,
            shifts: shiftsData,
            filteredByBranches: assignedBranchIds.length > 0
          });
          setAvailableShifts(shiftsData || []);
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

    validateToken();
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
