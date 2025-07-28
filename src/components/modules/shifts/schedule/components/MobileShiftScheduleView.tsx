
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Filter, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MobileShiftCard } from './MobileShiftCard';
import { MobileWeekSelector } from './MobileWeekSelector';
import { ShiftScheduleViewProps, PendingSubmission } from '../types';
import { ShiftSubmissionReminderButton } from './ShiftSubmissionReminderButton';
import { BulkWeekDeleteDialog } from './BulkWeekDeleteDialog';
import { startOfWeek, endOfWeek, isWithinInterval, format } from 'date-fns';

export const MobileShiftScheduleView: React.FC<ShiftScheduleViewProps & { onWeekDeleted?: () => void }> = ({
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
}) => {
  const [showNewShifts, setShowNewShifts] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Safely handle pendingSubmissions
  const safePendingSubmissions: PendingSubmission[] = Array.isArray(pendingSubmissions) 
    ? pendingSubmissions.filter((sub): sub is PendingSubmission => sub != null)
    : [];

  // Filter shifts by selected week
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 });
  
  const weekShifts = useMemo(() => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.shift_date);
      return isWithinInterval(shiftDate, { start: weekStart, end: weekEnd });
    });
  }, [shifts, weekStart, weekEnd]);

  // Group shifts by date
  const shiftsByDate = useMemo(() => {
    return weekShifts.reduce((acc, shift) => {
      const date = shift.shift_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(shift);
      return acc;
    }, {} as Record<string, typeof shifts>);
  }, [weekShifts]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      full: date.toLocaleDateString('he-IL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }),
      short: date.toLocaleDateString('he-IL', {
        day: 'numeric',
        month: 'short'
      })
    };
  };

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return 'לא משויך';
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא ידוע';
  };

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return 'לא משויך';
    const branch = branches.find(br => br.id === branchId);
    return branch ? branch.name : 'לא ידוע';
  };

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const handleShiftClick = (shift: any) => {
    if (isSelectionMode && onShiftSelection) {
      onShiftSelection(shift, !selectedShifts?.some(s => s.id === shift.id));
    } else {
      onShiftClick(shift);
    }
  };

  console.log('🔍 MobileShiftScheduleView - Debug info:', {
    shifts: shifts?.length || 0,
    employees: employees?.length || 0,
    branches: branches?.length || 0,
    pendingSubmissions: pendingSubmissions?.length || 0,
    weekShifts: weekShifts?.length || 0,
    businessId
  });

  return (
    <div className="space-y-4 p-4" dir="rtl">
      {/* Mobile Header */}
      <div className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">לוח משמרות</h2>
          </div>
          <p className="text-base font-semibold text-muted-foreground bg-secondary/30 px-3 py-2 rounded-lg border border-border/50">
            {format(weekStart, 'dd/MM')} - {format(weekEnd, 'dd/MM/yyyy')}
          </p>
        </div>

        {/* Week Selector */}
        <MobileWeekSelector
          selectedWeek={selectedWeek}
          onWeekChange={setSelectedWeek}
          shiftsCount={weekShifts.length}
        />

        {/* Mobile Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewShifts(!showNewShifts)}
            className="flex-1 min-w-0"
          >
            {showNewShifts ? <EyeOff className="h-4 w-4 ml-1" /> : <Eye className="h-4 w-4 ml-1" />}
            {showNewShifts ? 'הסתר חדשות' : 'הצג חדשות'}
          </Button>

          {safePendingSubmissions.length > 0 && onShowPendingSubmissions && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowPendingSubmissions}
              className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100 flex-1 min-w-0"
            >
              <Filter className="h-4 w-4 ml-1" />
              הגשות ({safePendingSubmissions.length})
            </Button>
          )}
        </div>

        {/* Secondary Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => onAddShift(selectedWeek)}
            className="flex-1"
          >
            <Plus className="h-4 w-4 ml-1" />
            הוסף משמרת
          </Button>
          <BulkWeekDeleteDialog onSuccess={onWeekDeleted} businessId={businessId} />
        </div>

        {/* Shift Submission Reminder - Only load when needed */}
        {employees.length > 0 && (
          <ShiftSubmissionReminderButton 
            employees={employees}
            businessId={businessId}
          />
        )}
      </div>

      {/* Mobile Shifts Display */}
      <div className="space-y-3">
        {Object.keys(shiftsByDate).length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">
                אין משמרות בשבוע {format(weekStart, 'dd/MM')} - {format(weekEnd, 'dd/MM')}
              </h3>
              <p className="text-base font-medium text-muted-foreground mb-4 bg-muted/30 p-3 rounded-lg border border-border">
                לא נמצאו משמרות בשבוע הנבחר
              </p>
              <Button onClick={() => onAddShift(selectedWeek)} size="lg" className="font-bold">
                <Plus className="h-5 w-5 ml-2" />
                הוסף משמרת לשבוע זה
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(shiftsByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dayShifts]) => {
              const dateInfo = formatDate(date);
              const isExpanded = expandedDates.has(date);
              
              return (
                <Collapsible key={date} open={isExpanded} onOpenChange={() => toggleDateExpansion(date)}>
                  <Card className="overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="pb-2 cursor-pointer hover:bg-secondary/20 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-bold text-foreground">{dateInfo.full}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="default" className="text-sm font-bold bg-primary text-primary-foreground">
                                {dayShifts.length} משמרות
                              </Badge>
                              {dayShifts.some(s => s.is_new) && showNewShifts && (
                                <Badge variant="outline" className="text-sm font-bold bg-success/10 text-success border-success">
                                  יש חדשות
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-6 w-6 text-primary" />
                          ) : (
                            <ChevronDown className="h-6 w-6 text-primary" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-3 px-3">
                        <div className="space-y-0">
                          {dayShifts.map((shift) => (
                            <MobileShiftCard
                              key={shift.id}
                              shift={shift}
                              getEmployeeName={getEmployeeName}
                              getBranchName={getBranchName}
                              isSelected={selectedShifts?.some(s => s.id === shift.id)}
                              showNewShifts={showNewShifts}
                              onClick={() => handleShiftClick(shift)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
        )}
      </div>
    </div>
  );
};
