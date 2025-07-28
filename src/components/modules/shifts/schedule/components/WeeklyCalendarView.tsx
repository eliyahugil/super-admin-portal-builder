import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, User, Clock, MapPin, CheckCircle2, X, Search } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import type { ShiftScheduleData, Employee, Branch } from '../types';

interface WeeklyCalendarViewProps {
  shifts: ShiftScheduleData[];
  employees: Employee[];
  branches: Branch[];
  currentDate: Date;
  pendingSubmissions?: any[]; // Add this prop
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
  onShiftClick,
  onShiftUpdate,
  onAddShift
}) => {
  const [assigningShift, setAssigningShift] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openAssignmentShift, setOpenAssignmentShift] = useState<string | null>(null);

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
    
    return pendingSubmissions.filter(submission => {
      // Match by date, time, and branch
      return submission.shift_date === shift.shift_date &&
             submission.start_time === shift.start_time &&
             submission.end_time === shift.end_time &&
             submission.branch_id === shift.branch_id;
    }).map(submission => submission.employee_id);
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

  // Add state to control whether to show by branches or unified
  const [viewMode, setViewMode] = useState<'unified' | 'by-branch'>('unified');

  const renderCalendar = (shiftsToShow: ShiftScheduleData[], title?: string) => {
    const filteredShiftsByDate = shiftsToShow.reduce((acc, shift) => {
      const date = shift.shift_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(shift);
      return acc;
    }, {} as Record<string, ShiftScheduleData[]>);

    return (
      <div className="w-full mb-4" dir="rtl">
        {title && (
          <h3 className="text-lg font-semibold mb-3 text-center">{title}</h3>
        )}
        
        {/* Calendar Header */}
        <div className="bg-muted/30 border border-border rounded-t-lg">
          <div className="grid grid-cols-7 gap-0">
            {dayNames.map((dayName, index) => (
              <div
                key={dayName}
                className="p-3 text-center border-l border-border first:border-l-0"
              >
                <div className="font-semibold text-sm text-foreground">
                  {dayName}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Content */}
        <div className="border-l border-r border-b border-border rounded-b-lg bg-background">
          <div className="grid grid-cols-7 gap-0 min-h-[400px]">
            {weekDays.map((date, index) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayShifts = filteredShiftsByDate[dateKey] || [];
              const isCurrentDay = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <div
                  key={dateKey}
                  className={`border-l border-border first:border-l-0 p-2 min-h-[400px] ${
                    isCurrentDay ? 'bg-primary/5' : 'bg-background'
                  }`}
                >
                  {/* Date */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
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
                      className="h-6 w-6 p-0 hover:bg-muted"
                      onClick={() => onAddShift(date)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Shifts */}
                  <div className="space-y-1">
                    {dayShifts
                      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                      .map(shift => (
                        <Card
                          key={shift.id}
                          className="p-2 bg-card border-border cursor-pointer hover:shadow-sm transition-all group"
                          onClick={() => onShiftClick(shift)}
                        >
                          <div className="space-y-1">
                            {/* Time - Enhanced visibility */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs font-bold">
                                <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                                <span className="text-foreground font-bold">
                                  {shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}
                                </span>
                              </div>
                              
                              {/* Branch name - more prominent */}
                              <div className="text-xs font-medium text-muted-foreground bg-muted px-1 rounded">
                                {getBranchName(shift.branch_id)}
                              </div>
                            </div>

                            {/* Employee - Enhanced with assignment popup */}
                            <div className="text-xs space-y-2">
                              {shift.employee_id ? (
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-green-600 flex-shrink-0" />
                                  <span className="text-green-700 font-medium truncate text-xs">
                                    {getEmployeeName(shift.employee_id)}
                                  </span>
                                </div>
                              ) : (
                                <div onClick={(e) => e.stopPropagation()} className="relative">
                                  {/* Assignment Button */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-5 px-2 text-xs w-full"
                                    onClick={() => {
                                      setOpenAssignmentShift(openAssignmentShift === shift.id ? null : shift.id);
                                      setSearchTerm('');
                                    }}
                                    disabled={assigningShift === shift.id}
                                  >
                                    {assigningShift === shift.id ? "משבץ..." : "שבץ עובד"}
                                  </Button>

                                  {/* Assignment Popup */}
                                  {openAssignmentShift === shift.id && (
                                    <div 
                                      className="absolute top-6 left-0 right-0 bg-background border border-border rounded-lg shadow-lg p-3 z-[100] max-h-64 overflow-hidden"
                                      style={{ minWidth: '250px' }}
                                    >
                                      {(() => {
                                        const { submittedEmployees, filteredEmployees } = getOrganizedEmployees(shift);
                                        
                                        return (
                                          <>
                                            {/* Header with close button */}
                                            <div className="flex items-center justify-between mb-2 pb-2 border-b">
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

                                            {/* Employees who submitted */}
                                            {submittedEmployees.length > 0 && (
                                              <div className="mb-3">
                                                <div className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
                                                  <CheckCircle2 className="h-3 w-3" />
                                                  עובדים שהגישו בקשה ({submittedEmployees.length})
                                                </div>
                                                <div className="space-y-1 max-h-20 overflow-y-auto">
                                                  {submittedEmployees.map(employee => (
                                                    <div
                                                      key={employee.id}
                                                      className="flex items-center justify-between p-1 bg-green-50 rounded text-xs"
                                                    >
                                                      <span className="text-green-800 font-medium">
                                                        {employee.first_name} {employee.last_name}
                                                      </span>
                                                      <div className="flex gap-1">
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          className="h-5 px-1 text-xs bg-green-100 hover:bg-green-200 text-green-800"
                                                          onClick={() => {
                                                            handleEmployeeAssignment(shift.id, employee.id);
                                                            setOpenAssignmentShift(null);
                                                          }}
                                                        >
                                                          שבץ
                                                        </Button>
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          className="h-5 px-1 text-xs text-red-600 hover:bg-red-50"
                                                          onClick={() => {
                                                            // TODO: Handle removal from submission
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
                                              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                                <Search className="h-3 w-3" />
                                                חיפוש עובדים אחרים
                                              </div>
                                              
                                              {/* Search input */}
                                              <div className="mb-2">
                                                <Input
                                                  placeholder="הקלד שם עובד..."
                                                  value={searchTerm}
                                                  onChange={(e) => setSearchTerm(e.target.value)}
                                                  className="h-6 text-xs"
                                                  autoFocus={submittedEmployees.length === 0}
                                                />
                                              </div>
                                              
                                              {/* Search results */}
                                              <div className="max-h-24 overflow-y-auto space-y-1">
                                                {filteredEmployees.length === 0 ? (
                                                  <div className="text-xs text-muted-foreground text-center py-2">
                                                    {searchTerm ? 'לא נמצאו עובדים התואמים לחיפוש' : 'הקלד כדי לחפש עובדים'}
                                                  </div>
                                                ) : (
                                                  filteredEmployees.map(employee => (
                                                    <div
                                                      key={employee.id}
                                                      className="flex items-center justify-between p-1 bg-muted/30 rounded text-xs hover:bg-muted/50 cursor-pointer"
                                                      onClick={() => {
                                                        handleEmployeeAssignment(shift.id, employee.id);
                                                        setOpenAssignmentShift(null);
                                                      }}
                                                    >
                                                      <span>{employee.first_name} {employee.last_name}</span>
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 px-1 text-xs"
                                                      >
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

                            {/* Status and badges */}
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={
                                  shift.status === 'assigned' ? 'default' :
                                  shift.status === 'pending' ? 'secondary' :
                                  'outline'
                                }
                                className="text-xs py-0 px-1 h-4"
                              >
                                {shift.status === 'assigned' ? 'משובץ' : 
                                 shift.status === 'pending' ? 'ממתין' : 
                                 shift.status}
                              </Badge>
                              
                              {shift.is_new && (
                                <Badge variant="outline" className="text-xs py-0 px-1 h-4 border-blue-500 text-blue-600">
                                  חדש
                                </Badge>
                              )}
                            </div>
                          </div>
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

  const formatDateKey = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const isToday = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={viewMode === 'unified' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('unified')}
        >
          לוח מאוחד
        </Button>
        <Button
          variant={viewMode === 'by-branch' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('by-branch')}
        >
          לוח לפי סניפים
        </Button>
      </div>

      {/* Render calendars based on view mode */}
      {viewMode === 'unified' ? (
        renderCalendar(shifts)
      ) : (
        <div className="space-y-8">
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