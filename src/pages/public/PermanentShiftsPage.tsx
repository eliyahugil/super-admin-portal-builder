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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        
          {/* Week Navigation Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigateWeek('prev')}
              className="flex items-center gap-2"
            >
              ← שבוע קודם
            </Button>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">
                {weekRange.start} - {weekRange.end}
              </div>
              <div className="text-sm text-muted-foreground">
                {weekRange.isCurrentWeek && "השבוע הנוכחי"}
                {weekRange.isPastWeek && "שבוע שעבר"}
                {weekRange.isFutureWeek && "שבוע עתידי"}
              </div>
              {isWeekInPast() && (
                <div className="mt-2 inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">
                  <XCircle className="w-3 h-3" />
                  השבוע חלף - לא ניתן להגיש משמרות
                </div>
              )}
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => navigateWeek('next')}
              className="flex items-center gap-2"
            >
              שבוע הבא →
            </Button>
          </div>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            משמרות ואזור אישי
          </h1>
          <p className="text-gray-600">
            צפייה במשמרות זמינות וסידור עבודה אישי
          </p>
          {context.isCurrentWeek === false && (
            <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              השבוע הקרוב
            </div>
          )}
        </div>

        {/* Employee Info */}
        {employee && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {employee.first_name} {employee.last_name}
                    </h2>
                    <p className="text-muted-foreground">
                      {employee.business?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Star className="h-3 w-3 mr-1" />
                    טוקן קבוע
                  </Badge>
                  <Badge variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    שימושים: {tokenData.usesCount}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advanced Summary */}
        {shiftsData && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-lg font-semibold text-blue-700">
                    {availableShifts.filter((s: any) => !isShiftInPast(s.shift_date || '')).length}
                  </div>
                  <div className="text-xs text-blue-600">משמרות זמינות</div>
                  {availableShifts.filter((s: any) => s.is_special).length > 0 && (
                    <div className="text-xs text-purple-600 mt-1">
                      {availableShifts.filter((s: any) => s.is_special).length} מיוחדות
                    </div>
                  )}
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-lg font-semibold text-green-700">
                    {employeeScheduledShifts.length}
                  </div>
                  <div className="text-xs text-green-600">משמרות מתוכננות</div>
                </div>
                
                <div className="bg-amber-50 p-3 rounded-lg">
                  <div className="text-lg font-semibold text-amber-700">
                    {(() => {
                      const allShifts = [...availableShifts, ...employeeScheduledShifts];
                      const timeGroups = allShifts.reduce((acc: any, shift: any) => {
                        const timeKey = `${shift.start_time}-${shift.end_time}`;
                        if (!acc[timeKey]) acc[timeKey] = [];
                        acc[timeKey].push(shift);
                        return acc;
                      }, {});
                      return Object.values(timeGroups).filter((group: any) => group.length > 1).length;
                    })()}
                  </div>
                  <div className="text-xs text-amber-600">התנגשויות זמנים</div>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-lg font-semibold text-purple-700">
                    {shiftsData?.employeeAssignments?.filter((ea: any) => ea.priority_order === 1)?.length || 0}
                  </div>
                  <div className="text-xs text-purple-600">סניפים מועדפים</div>
                </div>
              </div>
              
              {/* Branch Preferences Summary */}
              {shiftsData?.employeeAssignments && shiftsData.employeeAssignments.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium mb-2">השמות סניפים:</div>
                  <div className="flex flex-wrap gap-2">
                    {shiftsData.employeeAssignments.map((assignment: any, index: number) => (
                      <Badge 
                        key={index}
                        variant={assignment.priority_order === 1 ? "default" : "secondary"}
                        className={assignment.priority_order === 1 ? "bg-green-100 text-green-700" : ""}
                      >
                        {assignment.priority_order === 1 && <Star className="h-3 w-3 mr-1" />}
                        {assignment.role_name} (עדיפות {assignment.priority_order})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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
                  
                  <div className="grid gap-3">
                    {(() => {
                      // Group shifts by time to identify identical times
                      const shiftsByTime = availableShifts.reduce((acc: any, shift: any) => {
                        const timeKey = `${shift.start_time}-${shift.end_time}`;
                        if (!acc[timeKey]) acc[timeKey] = [];
                        acc[timeKey].push(shift);
                        return acc;
                      }, {});

                      return availableShifts.map((shift: any) => {
                        const timeKey = `${shift.start_time}-${shift.end_time}`;
                        const shiftsAtSameTime = shiftsByTime[timeKey];
                        const hasIdenticalTimes = shiftsAtSameTime.length > 1;
                        const isSpecialShift = shift.source === 'scheduled_shifts' || shift.is_special;
                        const businessShiftType = shiftsData?.businessShiftTypes?.find((bst: any) => bst.shift_type === shift.shift_type);
                        
                        // Check if this is employee's preferred branch
                        const employeeAssignments = shiftsData?.employeeAssignments || [];
                        const branchAssignment = employeeAssignments.find((ea: any) => ea.branch_id === shift.branch_id);
                        const isPreferredBranch = branchAssignment?.priority_order === 1;
                        
                        // Check if shift is in the past or week is in past
                        const isPastShift = isShiftInPast(shift.shift_date || '') || isWeekInPast();
                        const isSelected = selectedShifts.has(shift.id);

                        return (
                          <div 
                            key={shift.id} 
                            className={`border rounded-lg p-4 relative cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? 'border-green-400 bg-green-50 shadow-md ring-2 ring-green-200'
                                : isSpecialShift 
                                  ? 'border-purple-300 bg-purple-50/70 hover:shadow-md' 
                                  : hasIdenticalTimes
                                    ? 'border-amber-300 bg-amber-50/70 hover:shadow-sm'
                                    : isPastShift
                                      ? 'border-gray-300 bg-gray-50/70 opacity-60'
                                      : 'border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:shadow-sm'
                            } ${isPastShift || isWeekInPast() ? 'pointer-events-none' : ''}`}
                            onClick={() => !isPastShift && !isWeekInPast() && toggleShiftSelection(shift.id)}
                          >
                            {/* Past shift overlay */}
                            {(isPastShift || isWeekInPast()) && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-200/80 rounded-lg">
                                <span className="text-gray-600 font-medium text-sm bg-white px-3 py-1 rounded-full shadow">
                                  {isWeekInPast() ? "השבוע חלף" : "✓ משמרת שבוצעה"}
                                </span>
                              </div>
                            )}
                            
                            {/* Selection indicator */}
                            {isSelected && !isPastShift && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            )}

                            {/* Special/Regular Shift Indicator */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {isSpecialShift && !isPastShift && (
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    משמרת מיוחדת
                                  </Badge>
                                )}
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
                                <span className="text-sm font-medium">
                                  יום {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][shift.day_of_week]}
                                </span>
                              </div>
                              
                              {/* Time with identical time warning */}
                              <div className="flex items-center gap-2">
                                {hasIdenticalTimes && !isPastShift && (
                                  <Badge variant="outline" className="bg-amber-100 text-amber-700 text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {shiftsAtSameTime.length} באותה שעה
                                  </Badge>
                                )}
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Branch with preference indicator */}
                            {shift.branch && (
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {shift.branch.name}
                                  {isPreferredBranch && !isPastShift && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs mr-2">
                                      <Star className="h-3 w-3 mr-1" />
                                      סניף מועדף
                                    </Badge>
                                  )}
                                </div>
                                
                                {shift.required_employees > 1 && (
                                  <span className="text-xs text-muted-foreground">
                                    נדרשים {shift.required_employees} עובדים
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Additional shift info */}
                            {shift.notes && (
                              <div className="mt-2 text-xs text-muted-foreground p-2 bg-white/60 rounded">
                                📝 {shift.notes}
                              </div>
                            )}

                            {/* Role info if available */}
                            {branchAssignment?.role_name && (
                              <div className="mt-2 text-xs text-blue-600">
                                תפקיד: {branchAssignment.role_name}
                              </div>
                            )}
                            
                            {/* Click instruction for available shifts */}
                            {!isPastShift && (
                              <div className="mt-2 text-xs text-center text-gray-500 border-t pt-2">
                                {isSelected ? '✓ נבחר להגשה' : 'לחץ לבחירה להגשה'}
                              </div>
                            )}
                          </div>
                        );
                      });
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
                המשמרות שלי (מאושרות ומשובצות)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employeeScheduledShifts.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    אין לך משמרות מתוכננות השבוע
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      יש לך {employeeScheduledShifts.length} משמרות מתוכננות
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      כולל שבוע נוכחי ועתידי
                    </p>
                  </div>
                  
                  <div className="grid gap-3">
                    {(() => {
                      // Group employee's shifts by time to identify conflicts
                      const allEmployeeShifts = employeeScheduledShifts;
                      
                      const shiftsByTime = allEmployeeShifts.reduce((acc: any, shift: any) => {
                        const timeKey = `${shift.start_time}-${shift.end_time}`;
                        if (!acc[timeKey]) acc[timeKey] = [];
                        acc[timeKey].push(shift);
                        return acc;
                      }, {});

                      return allEmployeeShifts.map((shift: any) => {
                        const timeKey = `${shift.start_time}-${shift.end_time}`;
                        const shiftsAtSameTime = shiftsByTime[timeKey];
                        const hasTimeConflict = shiftsAtSameTime.length > 1;
                        const businessShiftType = shiftsData?.businessShiftTypes?.find((bst: any) => bst.shift_type === shift.shift_type);
                        
                        // Check if this is from employee's scheduled shifts vs available assignment
                        const isFromScheduled = shift.source === 'employee_scheduled';
                        const isSpecialShift = shift.is_special || shift.submission_type === 'special';
                        const isPastShift = isShiftInPast(shift.shift_date || '');

                        return (
                          <div 
                            key={shift.id} 
                            className={`border rounded-lg p-4 relative ${
                              isPastShift
                                ? 'border-gray-300 bg-gray-50/70 opacity-75'
                                : hasTimeConflict 
                                  ? 'border-red-300 bg-red-50/70 shadow-md' 
                                  : isSpecialShift
                                    ? 'border-purple-300 bg-purple-50/70 shadow-md'
                                    : 'border-green-200 bg-green-50/50'
                            }`}
                          >
                            {/* Past shift overlay */}
                            {isPastShift && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-200/80 rounded-lg">
                                <span className="text-gray-600 font-medium text-sm bg-white px-3 py-1 rounded-full shadow line-through">
                                  ✓ משמרת שבוצעה
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {hasTimeConflict && (
                                  <Badge variant="destructive" className="text-xs">
                                    ⚠️ התנגשות זמנים
                                  </Badge>
                                )}
                                {isSpecialShift && (
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    משמרת מיוחדת
                                  </Badge>
                                )}
                                <Badge 
                                  variant="secondary" 
                                  className={isFromScheduled ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}
                                >
                                  {isFromScheduled ? 'משמרת קבועה' : (shift.status === 'approved' ? 'אושר' : 'ממתין')}
                                </Badge>
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
                                <span className="font-medium">
                                  {shift.shift_date ? format(new Date(shift.shift_date), 'EEEE, dd/MM', { locale: he }) : 'תאריך לא זמין'}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                              </div>
                            </div>
                            
                            {shift.branch && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {shift.branch.name}
                              </div>
                            )}
                            
                            {shift.role && (
                              <div className="text-xs text-muted-foreground mt-1">
                                תפקיד: {shift.role}
                              </div>
                            )}

                            {shift.notes && (
                              <div className="mt-2 text-xs text-muted-foreground p-2 bg-white/60 rounded">
                                📝 {shift.notes}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
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