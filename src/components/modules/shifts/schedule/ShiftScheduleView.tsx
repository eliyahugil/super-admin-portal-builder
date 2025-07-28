
import React, { useState, useCallback, useMemo } from 'react';
import { useDeviceType } from '@/hooks/useDeviceType';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Eye, EyeOff, Grid, List, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ShiftScheduleViewProps, PendingSubmission } from './types';
import { ShiftSubmissionReminderButton } from './components/ShiftSubmissionReminderButton';
import { BulkWeekDeleteDialog } from './components/BulkWeekDeleteDialog';
import { MobileShiftScheduleView } from './components/MobileShiftScheduleView';
import { WeeklyCalendarView } from './components/WeeklyCalendarView';
import { ImprovedWeekSelector } from './components/ImprovedWeekSelector';
import { AdvancedScheduleFilters } from './components/AdvancedScheduleFilters';
import { UnsubmittedEmployeeAssignment } from './components/UnsubmittedEmployeeAssignment';
import { useRealData } from '@/hooks/useRealData';
import { useShiftsByDateRange } from './hooks/useShiftsByDateRange';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export const ShiftScheduleView: React.FC<ShiftScheduleViewProps & { onWeekDeleted?: () => void }> = (props) => {
  const { type: deviceType } = useDeviceType();
  const [selectedShiftForAssignment, setSelectedShiftForAssignment] = useState<any>(null);

  const {
    shifts,
    employees,
    branches,
    currentDate,
    holidays,
    shabbatTimes,
    calendarEvents,
    pendingSubmissions = [],
    businessId,
    onShiftClick,
    onShiftUpdate,
    onAddShift,
    onShiftDelete,
    isSelectionMode,
    selectedShifts,
    onShiftSelection,
    onShowPendingSubmissions,
    onWeekDeleted,
    // Filter props with default values
    filters = { status: 'all', employee: 'all', branch: 'all', role: 'all' },
    onFiltersChange = () => {},
    onQuickFilter = () => {},
    onResetFilters = () => {}
  } = props;

  // State for view preferences (will be managed internally for now)
  const [viewType, setViewType] = useState<'list' | 'week'>('week');
  const [showNewShifts, setShowNewShifts] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Local storage key for preferences
  const getPreferencesKey = () => `shift_schedule_preferences_${businessId}`;

  // Load preferences from localStorage
  React.useEffect(() => {
    if (!businessId) return;
    
    try {
      const stored = localStorage.getItem(getPreferencesKey());
      if (stored) {
        const prefs = JSON.parse(stored);
        setViewType(prefs.viewType || 'week');
        setShowNewShifts(prefs.showNewShifts !== false);
        if (prefs.selectedWeek) {
          setSelectedWeek(new Date(prefs.selectedWeek));
        }
        console.log('📋 Loaded preferences:', prefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, [businessId]);

  // Save preferences to localStorage
  const savePreferences = React.useCallback(() => {
    if (!businessId) return;
    
    const prefs = {
      viewType,
      showNewShifts,
      selectedWeek: selectedWeek.toISOString(),
      lastUpdated: Date.now()
    };
    
    try {
      localStorage.setItem(getPreferencesKey(), JSON.stringify(prefs));
      console.log('💾 Saved preferences:', prefs);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [businessId, viewType, showNewShifts, selectedWeek]);

  // Reset preferences to defaults
  const resetPreferences = React.useCallback(() => {
    const defaults = {
      viewType: 'week' as const,
      showNewShifts: true,
      selectedWeek: new Date().toISOString(),
      lastUpdated: Date.now()
    };
    
    try {
      localStorage.setItem(getPreferencesKey(), JSON.stringify(defaults));
      setViewType(defaults.viewType);
      setShowNewShifts(defaults.showNewShifts);
      setSelectedWeek(new Date(defaults.selectedWeek));
      toast.success('העדפות התצוגה אופסו בהצלחה');
      console.log('🔄 Reset preferences to defaults');
    } catch (error) {
      console.error('Error resetting preferences:', error);
      toast.error('שגיאה באיפוס העדפות');
    }
  }, [businessId]);

  // Save preferences when they change
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      savePreferences();
      // הראה הודעה רק פעם ראשונה או לאחר שינוי משמעותי
      const shouldShowMessage = !localStorage.getItem(`${getPreferencesKey()}_notified`);
      if (shouldShowMessage) {
        toast.success('העדפות התצוגה נשמרו אוטומטית', { duration: 3000 });
        localStorage.setItem(`${getPreferencesKey()}_notified`, 'true');
      }
    }, 1000); // דיליי קטן כדי לא לשמור כל שינוי מיידית

    return () => clearTimeout(timeoutId);
  }, [savePreferences]);

  // If mobile, use the mobile-optimized view
  if (deviceType === 'mobile') {
    return <MobileShiftScheduleView {...props} />;
  }

  // Get shifts for the selected week
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

  const { data: weekShifts = [], isLoading: isWeekLoading } = useShiftsByDateRange(weekStartStr, weekEndStr);

  // טעינת תפקידים למקרה שצריך להציג שמות תפקידים
  const { data: roles = [] } = useRealData<any>({
    queryKey: ['shift-roles-for-display', businessId],
    tableName: 'shift_roles',
    filters: { business_id: businessId, is_active: true },
    enabled: !!businessId,
  });

  // Safely handle pendingSubmissions - ensure it's an array of proper type
  const safePendingSubmissions: PendingSubmission[] = Array.isArray(pendingSubmissions) 
    ? pendingSubmissions.filter((sub): sub is PendingSubmission => sub != null)
    : [];

  // Use the properly typed shifts for display
  const displayShifts = viewType === 'week' ? weekShifts : shifts;

  // Memoize handlers to prevent unnecessary re-renders
  const handleShiftClick = useCallback((shift: any) => {
    if (isSelectionMode && onShiftSelection) {
      onShiftSelection(shift, !selectedShifts?.some(s => s.id === shift.id));
    } else {
      onShiftClick(shift);
    }
  }, [isSelectionMode, onShiftSelection, selectedShifts, onShiftClick]);

  const handleQuickFilter = useCallback((type: 'today' | 'tomorrow' | 'this_week' | 'next_week') => {
    onQuickFilter(type);
  }, [onQuickFilter]);

  const handleShiftAssignment = useCallback((shift: any) => {
    setSelectedShiftForAssignment(shift);
  }, []);

  // Memoize expensive computations
  const groupedShifts = useMemo(() => {
    return Object.entries(
      displayShifts.reduce((acc, shift) => {
        const date = shift.shift_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(shift);
        return acc;
      }, {} as Record<string, typeof displayShifts>)
    ).sort(([a], [b]) => a.localeCompare(b));
  }, [displayShifts]);

  return (
    <div className="space-y-6 w-full max-w-none" dir="rtl">
      {/* Advanced Filters */}
      <AdvancedScheduleFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        employees={employees}
        branches={branches}
        onQuickFilter={handleQuickFilter}
        onResetFilters={onResetFilters}
      />

      {/* Week selector - only show when in week view */}
      {viewType === 'week' && (
        <ImprovedWeekSelector
          selectedWeek={selectedWeek}
          onWeekChange={setSelectedWeek}
          shiftsCount={weekShifts.length}
        />
      )}

        {/* Header with actions and preferences info */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-3 rounded-lg border border-primary/10 mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Save className="h-4 w-4 text-primary" />
            <span className="font-medium">העדפות התצוגה נשמרות אוטומטית עבור העסק שלך</span>
          </div>
        </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">לוח משמרות מתקדם</h2>
              <p className="text-sm text-gray-600">
                {viewType === 'week' 
                  ? `שבוע ${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM/yyyy')}`
                  : currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={viewType === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('week')}
            >
              <Grid className="h-4 w-4" />
              תצוגה שבועית
            </Button>
            
            <Button
              variant={viewType === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('list')}
            >
              <List className="h-4 w-4" />
              תצוגת רשימה
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewShifts(!showNewShifts)}
            >
              {showNewShifts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showNewShifts ? 'הסתר חדשות' : 'הצג חדשות'}
            </Button>

            {safePendingSubmissions.length > 0 && onShowPendingSubmissions && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowPendingSubmissions}
                className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
              >
                הגשות ממתינות ({safePendingSubmissions.length})
              </Button>
            )}

            <BulkWeekDeleteDialog onSuccess={onWeekDeleted} businessId={businessId} />

            <Button
              variant="outline"
              size="sm"
              onClick={resetPreferences}
              className="hidden sm:flex"
              title="איפוס העדפות תצוגה"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden lg:inline ml-1">איפוס העדפות</span>
            </Button>

            <Button
              size="sm"
              onClick={() => onAddShift(viewType === 'week' ? selectedWeek : currentDate)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">הוסף משמרת</span>
              <span className="sm:hidden">הוסף</span>
            </Button>
          </div>
        </div>

        {/* Shift Submission Reminder Section - Only when employees exist */}
        {employees.length > 0 && (
          <ShiftSubmissionReminderButton 
            employees={employees}
            businessId={businessId}
          />
        )}
      </div>

      {/* Loading state for week view */}
      {viewType === 'week' && isWeekLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Shifts Display */}
      {viewType === 'week' && !isWeekLoading ? (
        <WeeklyCalendarView
          shifts={weekShifts}
          employees={employees}
          branches={branches}
          currentDate={selectedWeek}
          pendingSubmissions={safePendingSubmissions}
          onShiftClick={handleShiftClick}
          onShiftUpdate={onShiftUpdate}
          onAddShift={onAddShift}
        />
        ) : viewType === 'list' ? (
        <div className="space-y-4 w-full max-w-none">
          {displayShifts.length === 0 ? (
            <Card className="w-full">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">אין משמרות להצגה</h3>
                <p className="text-gray-600 mb-4">לא נמצאו משמרות בתקופה הנבחרת</p>
                <Button onClick={() => onAddShift(currentDate)}>
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף משמרת ראשונה
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Use memoized grouped shifts
            groupedShifts.map(([date, dayShifts]) => (
              <Card key={date} className="overflow-hidden w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{new Date(date).toLocaleDateString('he-IL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}</span>
                    <span className="text-sm font-normal text-gray-500">
                      {dayShifts.length} משמרות
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2">
                    {dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className={`p-4 border-r-4 hover:bg-gray-50 transition-colors ${
                          shift.is_new && showNewShifts ? 'border-r-blue-500 bg-blue-50' : 'border-r-gray-200'
                        } ${
                          selectedShifts?.some(s => s.id === shift.id) ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 cursor-pointer" onClick={() => handleShiftClick(shift)}>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                              <span className="font-medium">
                                {shift.start_time} - {shift.end_time}
                              </span>
                              <span className="text-sm text-gray-600">
                                {shift.employee_id 
                                  ? employees.find(e => e.id === shift.employee_id)?.first_name + ' ' + 
                                    employees.find(e => e.id === shift.employee_id)?.last_name
                                  : 'לא משובץ'
                                }
                              </span>
                              <span className="text-sm text-gray-500">
                                {branches.find(b => b.id === shift.branch_id)?.name || 'לא משויך'}
                              </span>
                            </div>
                            {shift.notes && (
                              <p className="text-sm text-gray-600">{shift.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <UnsubmittedEmployeeAssignment
                              shift={shift}
                              employees={employees}
                              branches={branches}
                              onShiftUpdate={onShiftUpdate}
                            />
                            
                            {shift.is_new && showNewShifts && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                חדש
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : null}

      {/* Employee Assignment Dialog */}
      {selectedShiftForAssignment && (
        <UnsubmittedEmployeeAssignment
          shift={selectedShiftForAssignment}
          employees={employees}
          branches={branches}
          onShiftUpdate={onShiftUpdate}
          onClose={() => setSelectedShiftForAssignment(null)}
        />
      )}
    </div>
  );
};
