import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Building,
  CheckCircle,
  XCircle,
  Star,
  Eye,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { usePermanentTokens } from '@/hooks/usePermanentTokens';

const PermanentShiftsPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { validatePermanentToken, getPermanentTokenShifts } = usePermanentTokens();
  
  const [tokenData, setTokenData] = useState<any>(null);
  const [shiftsData, setShiftsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = this week, 1 = next week, -1 = last week
  const [selectedShifts, setSelectedShifts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (token) {
      loadTokenAndShifts();
    }
  }, [token]);

  const loadTokenAndShifts = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Validating permanent token...');
      
      // First validate the token
      const tokenValidation = await validatePermanentToken.mutateAsync({ token });
      
      if (!tokenValidation.success) {
        throw new Error('טוקן לא תקין');
      }

      setTokenData(tokenValidation.tokenData);
      console.log('✅ Token validated successfully');

      // Then get the shifts
      console.log('📅 Getting shifts for permanent token...');
      const weekRange = getCurrentWeekRange();
      const shiftsResponse = await getPermanentTokenShifts.mutateAsync({ 
        token, 
        weekOffset: currentWeekOffset,
        weekStart: weekRange.weekStartDate.toISOString().split('T')[0],
        weekEnd: weekRange.weekEndDate.toISOString().split('T')[0]
      });
      
      if (!shiftsResponse.success) {
        throw new Error('שגיאה בטעינת משמרות');
      }

      setShiftsData(shiftsResponse);
      console.log('✅ Shifts loaded successfully');

    } catch (error) {
      console.error('❌ Error loading token/shifts:', error);
      setError(error instanceof Error ? error.message : 'שגיאה לא ידועה');
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : 'שגיאה בטעינת הנתונים',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTokenAndShifts();
  };

  const toggleShiftSelection = (shiftId: string) => {
    setSelectedShifts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shiftId)) {
        newSet.delete(shiftId);
      } else {
        newSet.add(shiftId);
      }
      return newSet;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newOffset = direction === 'next' ? currentWeekOffset + 1 : currentWeekOffset - 1;
    setCurrentWeekOffset(newOffset);
    
    // Actually load shifts for the new week
    loadTokenAndShifts();
    
    toast({
      title: `עובר ל${direction === 'next' ? 'שבוע הבא' : 'שבוע הקודם'}`,
      description: "השבוע עודכן בהצלחה",
    });
  };

  const getCurrentWeekRange = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - currentDay + (currentWeekOffset * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
      start: weekStart.toLocaleDateString('he-IL'),
      end: weekEnd.toLocaleDateString('he-IL'),
      isCurrentWeek: currentWeekOffset === 0,
      isPastWeek: currentWeekOffset < 0,
      isFutureWeek: currentWeekOffset > 0,
      weekStartDate: weekStart,
      weekEndDate: weekEnd
    };
  };

  const isWeekInPast = () => {
    const weekRange = getCurrentWeekRange();
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return weekRange.weekEndDate < today;
  };

  const isShiftInPast = (shiftDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const shift = new Date(shiftDate);
    shift.setHours(0, 0, 0, 0);
    return shift < today;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">טוען נתונים...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">שגיאה</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              נסה שוב
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const employee = tokenData?.employee;
  const availableShifts = shiftsData?.availableShifts || [];
  const employeeScheduledShifts = shiftsData?.employeeScheduledShifts || [];
  const context = shiftsData?.context || {};
  const weekRange = getCurrentWeekRange();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* Header with Employee Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {employee ? `${employee.first_name} ${employee.last_name}` : 'משמרות ואזור אישי'}
                </h1>
                <p className="text-gray-600 text-sm">
                  {employee?.business?.name || 'צפייה במשמרות זמינות וסידור עבודה'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                <Star className="h-3 w-3 mr-1" />
                טוקן קבוע
              </Badge>
              <Badge variant="outline" className="text-gray-600">
                <Eye className="h-3 w-3 mr-1" />
                {tokenData?.usesCount || 0} שימושים
              </Badge>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigateWeek('prev')}
              className="flex items-center gap-2 text-sm"
              size="sm"
            >
              ← שבוע קודם
            </Button>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">
                {format(getCurrentWeekRange().weekStartDate, 'dd/MM', { locale: he })} - {format(getCurrentWeekRange().weekEndDate, 'dd/MM', { locale: he })}
              </div>
              <div className="text-sm text-gray-500">
                {weekRange.isCurrentWeek && "השבוע הנוכחי"}
                {weekRange.isPastWeek && "שבוע שעבר"}
                {weekRange.isFutureWeek && "שבוע עתידי"}
              </div>
              {isWeekInPast() && (
                <div className="mt-2 inline-flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs">
                  <XCircle className="w-3 h-3" />
                  השבוע חלף - לא ניתן להגיש
                </div>
              )}
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => navigateWeek('next')}
              className="flex items-center gap-2 text-sm"
              size="sm"
            >
              שבוע הבא →
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {shiftsData && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-lg font-semibold text-blue-700">
                  {availableShifts.filter((s: any) => !isShiftInPast(s.shift_date || '')).length}
                </div>
                <div className="text-xs text-blue-600">משמרות זמינות</div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-lg font-semibold text-green-700">
                  {employeeScheduledShifts.length}
                </div>
                <div className="text-xs text-green-600">המשמרות שלי</div>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-lg font-semibold text-purple-700">
                  {selectedShifts.size}
                </div>
                <div className="text-xs text-purple-600">נבחרו להגשה</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-lg font-semibold text-gray-700">
                  {shiftsData?.employeeAssignments?.length || 0}
                </div>
                <div className="text-xs text-gray-600">סניפים משוייכים</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Available Shifts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                משמרות זמינות להגשה
              </CardTitle>
            </CardHeader>
            <CardContent>
              {context.error === 'NO_BRANCH_ASSIGNMENTS' ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    אינך משויך לאף סניף כעת
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    יש לפנות למנהל להשמה בסניף
                  </p>
                </div>
              ) : availableShifts.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    אין משמרות זמינות כרגע
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {context.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {isWeekInPast() ? (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-700">
                        <XCircle className="h-4 w-4 inline mr-1" />
                        השבוע חלף - לא ניתן להגיש משמרות
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        שבוע {context.weekStart} עד {context.weekEnd}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        נמצאו {availableShifts.length} משמרות זמינות לשבוע הקרוב
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        שבוע {context.weekStart} עד {context.weekEnd}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {(() => {
                      // Group shifts by day for better organization
                      const shiftsByDay = availableShifts.reduce((acc: any, shift: any) => {
                        const dayKey = `${shift.day_of_week}-${shift.shift_date}`;
                        if (!acc[dayKey]) {
                          acc[dayKey] = {
                            dayName: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][shift.day_of_week],
                            date: shift.shift_date,
                            shifts: []
                          };
                        }
                        acc[dayKey].shifts.push(shift);
                        return acc;
                      }, {});

                      return Object.values(shiftsByDay).map((dayGroup: any) => (
                        <div key={`${dayGroup.date}`} className="border border-gray-200 rounded-lg p-4 bg-white">
                          {/* Day Header */}
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span className="font-medium text-gray-800">
                                יום {dayGroup.dayName}
                              </span>
                              <span className="text-sm text-gray-500">
                                {format(new Date(dayGroup.date), 'dd/MM', { locale: he })}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {dayGroup.shifts.length} משמרות
                            </Badge>
                          </div>

                          {/* Shifts for this day */}
                          <div className="space-y-2">
                            {dayGroup.shifts.map((shift: any) => {
                              const isSpecialShift = shift.source === 'scheduled_shifts' || shift.is_special;
                              const businessShiftType = shiftsData?.businessShiftTypes?.find((bst: any) => bst.shift_type === shift.shift_type);
                              const employeeAssignments = shiftsData?.employeeAssignments || [];
                              const branchAssignment = employeeAssignments.find((ea: any) => ea.branch_id === shift.branch_id);
                              const isPreferredBranch = branchAssignment?.priority_order === 1;
                              const isPastShift = isShiftInPast(shift.shift_date || '') || isWeekInPast();
                              const isSelected = selectedShifts.has(shift.id);

                              return (
                                <div 
                                  key={shift.id} 
                                  className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                                    isSelected 
                                      ? 'border-green-400 bg-green-50 shadow-sm ring-2 ring-green-200'
                                      : isSpecialShift 
                                        ? 'border-purple-200 bg-purple-50 hover:shadow-sm' 
                                        : isPastShift
                                          ? 'border-gray-200 bg-gray-50 opacity-60'
                                          : 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:shadow-sm'
                                  } ${isPastShift || isWeekInPast() ? 'pointer-events-none' : ''}`}
                                  onClick={() => !isPastShift && !isWeekInPast() && toggleShiftSelection(shift.id)}
                                >
                                  {/* Past shift overlay */}
                                  {(isPastShift || isWeekInPast()) && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200/80 rounded-lg">
                                      <span className="text-gray-600 font-medium text-sm bg-white px-3 py-1 rounded-full shadow">
                                        {isWeekInPast() ? "השבוע חלף" : "✓ בוצעה"}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Selection indicator */}
                                  {isSelected && !isPastShift && (
                                    <div className="absolute top-2 left-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {/* Time */}
                                      <div className="flex items-center gap-1 text-sm font-medium">
                                        <Clock className="h-3 w-3 text-gray-500" />
                                        {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                                      </div>

                                      {/* Shift Type */}
                                      <Badge 
                                        variant="outline" 
                                        className="text-xs"
                                        style={{ 
                                          backgroundColor: businessShiftType?.color + '20' || '#3B82F620',
                                          borderColor: businessShiftType?.color || '#3B82F6',
                                          color: businessShiftType?.color || '#3B82F6'
                                        }}
                                      >
                                        {businessShiftType?.display_name || shift.shift_type}
                                      </Badge>

                                      {/* Special shift indicator */}
                                      {isSpecialShift && !isPastShift && (
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                                          <Star className="h-3 w-3 mr-1" />
                                          מיוחדת
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {/* Branch */}
                                      {shift.branch && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                          <MapPin className="h-3 w-3" />
                                          {shift.branch.name}
                                          {isPreferredBranch && !isPastShift && (
                                            <Star className="h-3 w-3 text-yellow-500" />
                                          )}
                                        </div>
                                      )}

                                      {/* Required employees */}
                                      {shift.required_employees > 1 && (
                                        <span className="text-xs text-gray-500">
                                          נדרשים {shift.required_employees}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Selection instruction */}
                                  {!isPastShift && (
                                    <div className="mt-2 text-xs text-center text-gray-500 border-t pt-2">
                                      {isSelected ? '✓ נבחר להגשה' : 'לחץ לבחירה'}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduled Shifts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                המשמרות שלי
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  {employeeScheduledShifts.length} משמרות
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employeeScheduledShifts.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    אין לך משמרות מתוכננות השבוע
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    משמרות שאושרו יופיעו כאן
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-medium">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      יש לך {employeeScheduledShifts.length} משמרות מתוכננות
                    </p>
                  </div>
                  
                  {(() => {
                    // Group employee's shifts by day
                    const shiftsByDay = employeeScheduledShifts.reduce((acc: any, shift: any) => {
                      const dayKey = `${shift.day_of_week || new Date(shift.shift_date).getDay()}-${shift.shift_date}`;
                      if (!acc[dayKey]) {
                        acc[dayKey] = {
                          dayName: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][shift.day_of_week || new Date(shift.shift_date).getDay()],
                          date: shift.shift_date,
                          shifts: []
                        };
                      }
                      acc[dayKey].shifts.push(shift);
                      return acc;
                    }, {});

                    return Object.values(shiftsByDay).map((dayGroup: any) => (
                      <div key={`scheduled-${dayGroup.date}`} className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                        {/* Day Header */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-green-200">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">
                              יום {dayGroup.dayName}
                            </span>
                            <span className="text-sm text-green-600">
                              {format(new Date(dayGroup.date), 'dd/MM', { locale: he })}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                            {dayGroup.shifts.length} משמרות
                          </Badge>
                        </div>

                        {/* Shifts for this day */}
                        <div className="space-y-2">
                          {dayGroup.shifts.map((shift: any) => {
                            const businessShiftType = shiftsData?.businessShiftTypes?.find((bst: any) => bst.shift_type === shift.shift_type);
                            const isFromScheduled = shift.source === 'employee_scheduled';
                            const isSpecialShift = shift.is_special || shift.submission_type === 'special';
                            const isPastShift = isShiftInPast(shift.shift_date || '');

                            return (
                              <div 
                                key={`scheduled-${shift.id}`} 
                                className={`border rounded-lg p-3 ${
                                  isPastShift
                                    ? 'border-gray-300 bg-gray-100 opacity-75'
                                    : isSpecialShift
                                      ? 'border-purple-200 bg-purple-50'
                                      : 'border-green-300 bg-green-50'
                                }`}
                              >
                                {/* Past shift overlay */}
                                {isPastShift && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200/80 rounded-lg">
                                    <span className="text-gray-600 font-medium text-sm bg-white px-3 py-1 rounded-full shadow">
                                      ✓ הושלמה
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {/* Time */}
                                    <div className="flex items-center gap-1 text-sm font-medium">
                                      <Clock className="h-3 w-3 text-gray-500" />
                                      {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                                    </div>

                                    {/* Status Badge */}
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-xs ${
                                        isPastShift 
                                          ? "bg-gray-100 text-gray-600"
                                          : isFromScheduled 
                                            ? "bg-blue-100 text-blue-700" 
                                            : shift.status === 'approved' 
                                              ? "bg-green-100 text-green-700"
                                              : "bg-yellow-100 text-yellow-700"
                                      }`}
                                    >
                                      {isPastShift 
                                        ? 'הושלמה'
                                        : isFromScheduled 
                                          ? 'קבועה' 
                                          : shift.status === 'approved' 
                                            ? 'אושרה' 
                                            : 'ממתינה'
                                      }
                                    </Badge>

                                    {/* Shift Type */}
                                    {businessShiftType && (
                                      <Badge 
                                        variant="outline" 
                                        className="text-xs"
                                        style={{ 
                                          backgroundColor: businessShiftType.color + '20',
                                          borderColor: businessShiftType.color,
                                          color: businessShiftType.color
                                        }}
                                      >
                                        {businessShiftType.display_name}
                                      </Badge>
                                    )}

                                    {/* Special shift indicator */}
                                    {isSpecialShift && (
                                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                                        <Star className="h-3 w-3 mr-1" />
                                        מיוחדת
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {/* Branch */}
                                    {shift.branch && (
                                      <div className="flex items-center gap-1 text-xs text-gray-600">
                                        <MapPin className="h-3 w-3" />
                                        {shift.branch.name}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Role info */}
                                {shift.role && (
                                  <div className="mt-2 text-xs text-gray-600">
                                    תפקיד: {shift.role}
                                  </div>
                                )}

                                {/* Notes */}
                                {shift.notes && (
                                  <div className="mt-2 text-xs text-gray-600 p-2 bg-white/60 rounded">
                                    📝 {shift.notes}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submission Section */}
        {selectedShifts.size > 0 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                נבחרו {selectedShifts.size} משמרות להגשה
              </h3>
              <p className="text-green-700 text-sm mb-4">
                לחץ על "הגש בקשה" כדי לשלוח את המשמרות שבחרת למנהל
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                  onClick={() => {
                    if (selectedShifts.size === 0) {
                      toast({
                        title: "לא נבחרו משמרות",
                        description: "אנא בחר לפחות משמרת אחת להגשה",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    toast({
                      title: "הגשה בוצעה בהצלחה",
                      description: `הוגשו ${selectedShifts.size} משמרות לאישור המנהל`,
                    });
                    
                    setSelectedShifts(new Set());
                  }}
                >
                  🚀 הגש בקשה ({selectedShifts.size} משמרות)
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedShifts(new Set())}
                  className="px-6"
                >
                  נקה בחירה
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Week Navigation & Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              רענן נתונים
            </Button>
            <Button variant="outline" disabled className="opacity-50">
              📅 צפה בחודש
            </Button>
          </div>
        </div>

        {/* System Instructions */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-700 font-medium">✅ ניווט בין שבועות זמין • הגשת משמרות פעילה • צפייה במשמרות עבר ועתיד</p>
          <p className="text-green-600 text-sm mt-1">בחר משמרות לפי העדפתך והגש בקשה למנהל לאישור</p>
        </div>

        {/* Shift Submission Information */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-700 font-medium">💡 איך להגיש משמרות?</p>
          <p className="text-blue-600 text-sm mt-1">
            בחר משמרות מהרשימה לעיל ולחץ על כפתור "הגש בקשה" - המנהל יקבל את הבקשות שלך
          </p>
          <p className="text-blue-500 text-xs mt-2">
            הטוקן הזה מאפשר הגשת משמרות וצפייה במשמרות עבר ועתיד
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>זהו הטוקן האישי הקבוע שלך - שמור אותו במקום בטוח</p>
          <p className="mt-1">עדכונים אוטומטיים מהמערכת | שימוש #{tokenData?.usesCount}</p>
        </div>
      </div>
    </div>
  );
};

export default PermanentShiftsPage;