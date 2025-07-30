import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, User, Clock, MapPin, CheckCircle2, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import type { ShiftScheduleData, Employee, Branch } from '../types';
import { useDeviceType } from '@/hooks/useDeviceType';

interface WeeklyCalendarViewProps {
  shifts: ShiftScheduleData[];
  employees: Employee[];
  branches: Branch[];
  currentDate: Date;
  pendingSubmissions?: any[];
  preferences?: any; // Add preferences prop
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftUpdate?: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
  onAddShift: (date: Date) => void;
}

export const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  shifts,
  employees,
  branches,
  currentDate,
  pendingSubmissions = [],
  preferences,
  onShiftClick,
  onShiftUpdate,
  onAddShift
}) => {
  const [assigningShift, setAssigningShift] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openAssignmentShift, setOpenAssignmentShift] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const { type: deviceType } = useDeviceType();
  
  console.log('🔍 WeeklyCalendarView RENDERED with shifts:', shifts.length, 'employees:', employees.length);
  console.log('🚀 WeeklyCalendarView onShiftUpdate exists:', !!onShiftUpdate);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  // Group shifts by date and branch
  const shiftsByDate = shifts.reduce((acc, shift) => {
    const date = shift.shift_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {} as Record<string, ShiftScheduleData[]>);

  // Group shifts by branch for separate calendar view option
  const shiftsByBranch = shifts.reduce((acc, shift) => {
    const branchId = shift.branch_id || 'unassigned';
    if (!acc[branchId]) {
      acc[branchId] = [];
    }
    acc[branchId].push(shift);
    return acc;
  }, {} as Record<string, ShiftScheduleData[]>);

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return null;
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : null;
  };

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return 'לא משויך';
    const branch = branches.find(br => br.id === branchId);
    return branch ? branch.name : 'לא ידוע';
  };

  const handleEmployeeAssignment = async (shiftId: string, employeeId: string) => {
    if (!onShiftUpdate) return;
    
    setAssigningShift(shiftId);
    try {
      await onShiftUpdate(shiftId, { 
        employee_id: employeeId,
        status: 'assigned'
      });
    } catch (error) {
      console.error('Error assigning employee:', error);
    } finally {
      setAssigningShift(null);
    }
  };

  // Helper function to get employees who submitted for a specific shift
  const getSubmittedEmployeesForShift = (shift: ShiftScheduleData) => {
    if (!pendingSubmissions || pendingSubmissions.length === 0) return [];
    
    const submittedEmployeeIds = [];
    
    // Each submission has a 'shifts' array with multiple shift preferences
    pendingSubmissions.forEach(submission => {
      const shiftBranch = branches.find(b => b.id === shift.branch_id);
      
      // Check if any of the submitted shifts match our current shift
      if (submission.shifts && Array.isArray(submission.shifts)) {
        const hasMatchingShift = submission.shifts.some(submittedShift => {
          const dateMatch = submittedShift.date === shift.shift_date;
          const startTimeMatch = submittedShift.start_time === shift.start_time;
          const endTimeMatch = submittedShift.end_time === shift.end_time;
          const branchMatch = submittedShift.branch_preference === shiftBranch?.name;
          
          return dateMatch && startTimeMatch && endTimeMatch && branchMatch;
        });
        
        if (hasMatchingShift) {
          submittedEmployeeIds.push(submission.employee_id);
        }
      }
    });
    
    return submittedEmployeeIds;
  };

  // Helper function to organize employees for dropdown
  const getOrganizedEmployees = (shift: ShiftScheduleData) => {
    const submittedEmployeeIds = getSubmittedEmployeesForShift(shift);
    
    const submittedEmployees = employees.filter(emp => submittedEmployeeIds.includes(emp.id));
    const filteredEmployees = employees.filter(emp => 
      !submittedEmployeeIds.includes(emp.id) && 
      (emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    return { submittedEmployees, filteredEmployees };
  };

  // Use view mode from preferences (default to 'by-branch' for better management)
  const [viewMode, setViewMode] = useState<'unified' | 'by-branch'>(
    (preferences?.calendarViewMode as 'unified' | 'by-branch') || 'by-branch'
  );

  // Toggle day expansion for mobile/tablet
  const toggleDayExpansion = (dateKey: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  // Mobile/Tablet List View Component
  const MobileWeekView = ({ shiftsToShow, title }: { shiftsToShow: ShiftScheduleData[], title?: string }) => {
    const filteredShiftsByDate = shiftsToShow.reduce((acc, shift) => {
      const date = shift.shift_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(shift);
      return acc;
    }, {} as Record<string, ShiftScheduleData[]>);

    return (
      <div className="space-y-4" dir="rtl">
        {title && (
          <h3 className="text-lg font-semibold text-center">{title}</h3>
        )}
        
        {weekDays.map((date, index) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayShifts = filteredShiftsByDate[dateKey] || [];
          const isCurrentDay = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const isExpanded = expandedDays[dateKey] || dayShifts.length === 0;
          
          return (
            <Card key={dateKey} className={`${isCurrentDay ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
              <div 
                className="p-4 cursor-pointer"
                onClick={() => dayShifts.length > 0 && toggleDayExpansion(dateKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCurrentDay
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {format(date, 'd')}
                    </div>
                    <div>
                      <div className="font-semibold">{dayNames[index]}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(date, 'dd/MM')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {dayShifts.length} משמרות
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddShift(date);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    {dayShifts.length > 0 && (
                      isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>
              
              {isExpanded && dayShifts.length > 0 && (
                <div className="px-4 pb-4 space-y-3">
                  {dayShifts
                    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                    .map(shift => (
                       <Card
                         key={shift.id}
                         className="p-3 bg-white border-2 border-border/50 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                         onClick={() => onShiftClick(shift)}
                       >
                        <div className="space-y-2">
                           {/* Time and Branch */}
                           <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2 font-bold text-sm">
                               <Clock className="h-4 w-4 text-primary" />
                               <span className="text-foreground">{shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               {(() => {
                                 const submissionCount = getSubmittedEmployeesForShift(shift).length;
                                 return submissionCount > 0 ? (
                                   <div className="bg-success text-success-foreground text-xs px-2 py-1 rounded-full font-bold min-w-[24px] h-6 flex items-center justify-center shadow-sm">
                                     {submissionCount}
                                   </div>
                                 ) : null;
                               })()}
                               <Badge variant="secondary" className="text-xs font-semibold">
                                 {getBranchName(shift.branch_id)}
                               </Badge>
                             </div>
                           </div>

                          {/* Employee Assignment */}
                          <div className="text-sm">
                             {shift.employee_id ? (
                               <div className="flex items-center gap-2 p-2 bg-success/10 rounded-md border border-success/20">
                                 <CheckCircle2 className="h-4 w-4 text-success" />
                                 <span className="text-success font-bold text-sm">
                                   {getEmployeeName(shift.employee_id)}
                                 </span>
                               </div>
                            ) : (
                               <div onClick={(e) => e.stopPropagation()}>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   className="w-full bg-white border-2 border-primary/30 text-primary font-bold hover:bg-primary/5 hover:border-primary"
                                     onClick={() => {
                                      console.log('🔥 CLICKED ASSIGN BUTTON for shift:', shift.id, 'onShiftUpdate exists:', !!onShiftUpdate);
                                      setOpenAssignmentShift(openAssignmentShift === shift.id ? null : shift.id);
                                      setSearchTerm('');
                                    }}
                                  disabled={assigningShift === shift.id}
                                >
                                  {assigningShift === shift.id ? "משבץ..." : "שבץ עובד"}
                                </Button>

                                {/* Assignment Popup for Mobile */}
                                {openAssignmentShift === shift.id && (
                                  <div className="mt-3 bg-background border border-border rounded-lg p-3 space-y-3">
                                    {(() => {
                                      const { submittedEmployees, filteredEmployees } = getOrganizedEmployees(shift);
                                      
                                      return (
                                        <>
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium">שיבוץ עובד למשמרת</span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setOpenAssignmentShift(null)}
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>

                                          {/* Mobile version of employee assignment */}
                                          {submittedEmployees.length > 0 && (
                                            <div>
                                              <div className="text-sm font-medium text-green-700 mb-2">
                                                עובדים שהגישו בקשה ({submittedEmployees.length})
                                              </div>
                                              <div className="space-y-2">
                                                {submittedEmployees.map(employee => (
                                                  <div
                                                    key={employee.id}
                                                    className="flex items-center justify-between p-2 bg-green-50 rounded"
                                                  >
                                                    <span className="text-green-800 font-medium text-sm">
                                                      {employee.first_name} {employee.last_name}
                                                    </span>
                                                    <div className="flex gap-2">
                                                      <Button
                                                        size="sm"
                                                        className="h-7 px-2 text-xs"
                                                         onClick={async () => {
                                                           console.log('🔄 WeeklyCalendarView - Assigning employee:', { employeeId: employee.id, shiftId: shift.id });
                                                           if (onShiftUpdate) {
                                                             try {
                                                               setAssigningShift(shift.id);
                                                               await onShiftUpdate(shift.id, { employee_id: employee.id, status: 'assigned' });
                                                               setOpenAssignmentShift(null);
                                                               console.log('✅ WeeklyCalendarView - Assignment successful');
                                                             } catch (error) {
                                                               console.error('❌ WeeklyCalendarView - Assignment failed:', error);
                                                             } finally {
                                                               setAssigningShift(null);
                                                             }
                                                           }
                                                         }}
                                                      >
                                                        שבץ
                                                      </Button>
                                                      <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs"
                                                        onClick={() => {
                                                          console.log('Remove submission for:', employee.id);
                                                        }}
                                                      >
                                                        הסר
                                                      </Button>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Search section */}
                                          <div>
                                            <div className="text-sm font-medium mb-2">חיפוש עובדים אחרים</div>
                                            <Input
                                              placeholder="הקלד שם עובד..."
                                              value={searchTerm}
                                              onChange={(e) => setSearchTerm(e.target.value)}
                                              className="mb-2"
                                            />
                                            
                                            <div className="max-h-32 overflow-y-auto space-y-1">
                                              {filteredEmployees.length === 0 ? (
                                                <div className="text-sm text-muted-foreground text-center py-2">
                                                  {searchTerm ? 'לא נמצאו עובדים התואמים לחיפוש' : 'הקלד כדי לחפש עובדים'}
                                                </div>
                                              ) : (
                                                filteredEmployees.map(employee => (
                                                  <div
                                                    key={employee.id}
                                                    className="flex items-center justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 cursor-pointer"
                                                     onClick={async () => {
                                                       console.log('🔄 WeeklyCalendarView - Other employee assignment:', { employeeId: employee.id, shiftId: shift.id });
                                                       if (onShiftUpdate) {
                                                         try {
                                                           setAssigningShift(shift.id);
                                                           await onShiftUpdate(shift.id, { employee_id: employee.id, status: 'assigned' });
                                                           setOpenAssignmentShift(null);
                                                           console.log('✅ WeeklyCalendarView - Other employee assignment successful');
                                                         } catch (error) {
                                                           console.error('❌ WeeklyCalendarView - Other employee assignment failed:', error);
                                                         } finally {
                                                           setAssigningShift(null);
                                                         }
                                                       }
                                                     }}
                                                  >
                                                    <span className="text-sm">{employee.first_name} {employee.last_name}</span>
                                                    <Button size="sm" className="h-6 px-2 text-xs">
                                                      שבץ
                                                    </Button>
                                                  </div>
                                                ))
                                              )}
                                            </div>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Status badges */}
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={
                                shift.status === 'assigned' ? 'default' :
                                shift.status === 'pending' ? 'secondary' :
                                'outline'
                              }
                              className="text-xs"
                            >
                              {shift.status === 'assigned' ? 'משובץ' : 
                               shift.status === 'pending' ? 'ממתין' : 
                               shift.status}
                            </Badge>
                            
                            {shift.is_new && (
                              <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                                חדש
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  const renderCalendar = (shiftsToShow: ShiftScheduleData[], title?: string) => {
    // Use mobile/tablet view for smaller screens
    if (deviceType === 'mobile') {
      return <MobileWeekView shiftsToShow={shiftsToShow} title={title} />;
    }

    // Desktop Calendar View
    const desktopShiftsByDate = shiftsToShow.reduce((acc, shift) => {
      const date = shift.shift_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(shift);
      return acc;
    }, {} as Record<string, ShiftScheduleData[]>);

    return (
      <div className="w-full max-w-none mb-4" dir="rtl">
        {title && (
          <h3 className="text-lg font-semibold mb-3 text-center">{title}</h3>
        )}
        
        {/* Calendar Header - Responsive */}
        <div className="bg-muted/30 border border-border rounded-t-lg w-full">
          <div className="grid grid-cols-7 gap-0">
            {dayNames.map((dayName, index) => (
              <div
                key={dayName}
                className="p-2 lg:p-3 text-center border-l border-border first:border-l-0"
              >
                <div className="font-semibold text-xs lg:text-sm text-foreground">
                  {dayName}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Content - Full width utilization */}
        <div className="border-l border-r border-b border-border rounded-b-lg bg-background w-full">
          <div className="grid grid-cols-7 gap-0 min-h-[500px] lg:min-h-[700px] w-full">
            {weekDays.map((date, index) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayShifts = desktopShiftsByDate[dateKey] || [];
              const isCurrentDay = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <div
                  key={dateKey}
                  className={`border-l border-border first:border-l-0 p-1.5 lg:p-3 min-h-[500px] lg:min-h-[700px] ${
                    isCurrentDay ? 'bg-primary/5' : 'bg-background'
                  }`}
                >
                  {/* Date - Responsive */}
                  <div className="flex items-center justify-between mb-2 lg:mb-3">
                    <div
                      className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium ${
                        isCurrentDay
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {format(date, 'd')}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 lg:h-6 lg:w-6 p-0 hover:bg-muted"
                      onClick={() => onAddShift(date)}
                    >
                      <Plus className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                    </Button>
                  </div>

                  {/* Shifts - Expanded for better readability */}
                  <div className="space-y-2">
                    {dayShifts
                      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                      .map(shift => (
                        <Card
                          key={shift.id}
                          className="p-2 bg-white border border-border cursor-pointer hover:shadow-sm transition-all group min-h-[60px]"
                          onClick={() => onShiftClick(shift)}
                        >
                          <div className="space-y-1">
                             {/* Time and submission count */}
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-1">
                                 <Clock className="h-2.5 w-2.5 text-primary flex-shrink-0" />
                                 <span className="text-foreground font-bold text-xs leading-tight">
                                   {shift.start_time?.slice(0, 5)}-{shift.end_time?.slice(0, 5)}
                                 </span>
                               </div>
                               {(() => {
                                 const submissionCount = getSubmittedEmployeesForShift(shift).length;
                                 return submissionCount > 0 ? (
                                   <div className="bg-success text-success-foreground text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[16px] h-4 flex items-center justify-center flex-shrink-0">
                                     {submissionCount}
                                   </div>
                                 ) : null;
                               })()}
                              </div>
                              
                              {/* Branch name - Compact but readable */}
                              <div className="text-xs font-medium text-foreground bg-secondary/80 px-1.5 py-1 rounded text-center border border-border/30 leading-tight">
                                {getBranchName(shift.branch_id)}
                              </div>
                            </div>
                            {/* Employee status - Compact */}
                            <div className="mt-1">
                              {shift.employee_id ? (
                                <div className="flex items-center gap-1 text-xs p-1 bg-success/10 rounded border border-success/20">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-success flex-shrink-0" />
                                  <span className="text-success font-medium truncate text-xs leading-tight">{getEmployeeName(shift.employee_id)}</span>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground font-medium p-1 bg-muted/20 rounded text-center border border-border/30 leading-tight">
                                  לא משובץ
                                </div>
                              )}
                            </div>

                            {/* Assignment button for non-assigned shifts */}
                            {!shift.employee_id && onShiftUpdate && (
                              <div onClick={(e) => e.stopPropagation()} className="mt-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-5 px-1 text-xs w-full"
                                 onClick={() => {
                                   console.log('🔥 CLICKED DESKTOP ASSIGN BUTTON for shift:', shift.id, 'onShiftUpdate exists:', !!onShiftUpdate);
                                   setOpenAssignmentShift(openAssignmentShift === shift.id ? null : shift.id);
                                   setSearchTerm('');
                                 }}
                                  disabled={assigningShift === shift.id}
                                >
                                  {assigningShift === shift.id ? "משבץ..." : "שבץ עובד"}
                                </Button>

                                {/* Assignment Popup */}
                                {openAssignmentShift === shift.id && (
                                  <div className="absolute top-5 left-0 right-0 bg-background border border-border rounded-lg shadow-lg p-2 z-[100] max-h-48 overflow-hidden" style={{ minWidth: '200px', maxWidth: '280px' }}>
                                    {(() => {
                                      const { submittedEmployees, filteredEmployees } = getOrganizedEmployees(shift);
                                      
                                      return (
                                        <>
                                          <div className="flex items-center justify-between mb-2 pb-1 border-b">
                                            <span className="text-xs font-medium">שיבוץ עובד למשמרת</span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-4 w-4 p-0"
                                              onClick={() => setOpenAssignmentShift(null)}
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </div>

                                          {submittedEmployees.length > 0 && (
                                            <div className="mb-2">
                                              <div className="text-xs font-medium text-green-700 mb-1 flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                עובדים שהגישו ({submittedEmployees.length})
                                              </div>
                                              <div className="space-y-1 max-h-16 overflow-y-auto">
                                                {submittedEmployees.map(employee => (
                                                  <div
                                                    key={employee.id}
                                                    className="flex items-center justify-between p-1 bg-green-50 rounded text-xs"
                                                  >
                                                    <span className="text-green-800 font-medium truncate">
                                                      {`${employee.first_name} ${employee.last_name}`}
                                                    </span>
                                                    <Button
                                                      size="sm"
                                                      className="h-4 px-1 text-xs"
                                                       onClick={async () => {
                                                         console.log('🔄 WeeklyCalendarView - Desktop submitted employee assignment:', { employeeId: employee.id, shiftId: shift.id });
                                                         if (onShiftUpdate) {
                                                           try {
                                                             setAssigningShift(shift.id);
                                                             await onShiftUpdate(shift.id, { employee_id: employee.id, status: 'assigned' });
                                                             setOpenAssignmentShift(null);
                                                             console.log('✅ WeeklyCalendarView - Desktop submitted employee assignment successful');
                                                           } catch (error) {
                                                             console.error('❌ WeeklyCalendarView - Desktop submitted employee assignment failed:', error);
                                                           } finally {
                                                             setAssigningShift(null);
                                                           }
                                                         }
                                                       }}
                                                    >
                                                      שבץ
                                                    </Button>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          <div>
                                            <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                              <Search className="h-3 w-3" />
                                              חיפוש עובדים
                                            </div>
                                            
                                            <div className="mb-1">
                                              <Input
                                                placeholder="הקלד שם עובד..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="h-5 text-xs"
                                              />
                                            </div>
                                            
                                            <div className="max-h-16 overflow-y-auto space-y-1">
                                              {filteredEmployees.length === 0 ? (
                                                <div className="text-xs text-muted-foreground text-center py-1">
                                                  {searchTerm ? 'לא נמצאו עובדים התואמים לחיפוש' : 'הקלד כדי לחפש עובדים'}
                                                </div>
                                              ) : (
                                                filteredEmployees.map(employee => (
                                                  <div
                                                    key={employee.id}
                                                    className="flex items-center justify-between p-1 bg-muted/30 rounded text-xs hover:bg-muted/50 cursor-pointer"
                                                     onClick={async () => {
                                                       console.log('🔄 WeeklyCalendarView - Desktop other employee assignment:', { employeeId: employee.id, shiftId: shift.id });
                                                       if (onShiftUpdate) {
                                                         try {
                                                           setAssigningShift(shift.id);
                                                           await onShiftUpdate(shift.id, { employee_id: employee.id, status: 'assigned' });
                                                           setOpenAssignmentShift(null);
                                                           console.log('✅ WeeklyCalendarView - Desktop other employee assignment successful');
                                                         } catch (error) {
                                                           console.error('❌ WeeklyCalendarView - Desktop other employee assignment failed:', error);
                                                         } finally {
                                                           setAssigningShift(null);
                                                         }
                                                       }
                                                      }}
                                                   >
                                                    <span className="truncate">
                                                      {`${employee.first_name} ${employee.last_name}`}
                                                    </span>
                                                  </div>
                                                ))
                                              )}
                                            </div>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            )}

                          </Card>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4 lg:space-y-6 w-full max-w-none" dir="rtl">
        {/* View Mode Toggle - Responsive */}
        <div className="flex items-center justify-center gap-2 lg:gap-4">
          <Button
            variant={viewMode === 'unified' ? 'default' : 'outline'}
            size={deviceType === 'mobile' ? 'sm' : 'default'}
            onClick={() => setViewMode('unified')}
            className="text-xs lg:text-sm"
          >
          לוח מאוחד
        </Button>
        <Button
          variant={viewMode === 'by-branch' ? 'default' : 'outline'}
          size={deviceType === 'mobile' ? 'sm' : 'default'}
          onClick={() => setViewMode('by-branch')}
          className="text-xs lg:text-sm"
        >
          לוח לפי סניפים
        </Button>
      </div>

      {/* Render calendars based on view mode - Responsive */}
      {viewMode === 'unified' ? (
        renderCalendar(shifts)
      ) : (
        <div className="space-y-6 lg:space-y-8">
          {/* Render calendar for each branch */}
          {Object.entries(shiftsByBranch).map(([branchId, branchShifts]) => {
            const branchName = branchId === 'unassigned' 
              ? 'לא משויך לסניף' 
              : getBranchName(branchId);
            
            return (
              <div key={branchId}>
                {renderCalendar(branchShifts, `סניף ${branchName}`)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};