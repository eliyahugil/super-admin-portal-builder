
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, User, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { ShiftAssignmentPopover } from './ShiftAssignmentPopover';
import { format, startOfWeek, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import type { ShiftScheduleData, Employee, Branch } from '../types';

interface WeekViewProps {
  shifts: ShiftScheduleData[];
  employees: Employee[];
  branches: Branch[];
  currentDate: Date;
  pendingSubmissions?: any[];
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftUpdate?: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
  onAddShift: (date: Date) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
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

  // יצירת שבוע מ-ראשון עד שבת
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // ראשון בשבוע
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(dayDate);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(currentDate);
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  // קיבוץ משמרות לפי תאריך
  const shiftsByDate = shifts.reduce((acc, shift) => {
    const date = shift.shift_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
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

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'numeric'
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
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

  return (
    <div className="space-y-4 w-full max-w-none overflow-x-auto" dir="rtl">
      <div className="grid grid-cols-7 gap-1 w-full min-w-[1200px]">
        {weekDates.map((date, index) => {
          const dateKey = formatDateKey(date);
          const dayShifts = shiftsByDate[dateKey] || [];
          const isCurrentDay = isToday(date);
          
          return (
            <Card 
              key={dateKey} 
              className={`min-h-[400px] lg:min-h-[500px] w-full ${isCurrentDay ? 'ring-2 ring-primary bg-primary/5' : ''}`}
            >
              <CardHeader className="pb-3 p-3 sm:p-4">
                <CardTitle className="text-sm flex flex-col items-center gap-2">
                  <span className="text-muted-foreground font-medium">{dayNames[index]}</span>
                  <span className={`text-xl font-bold ${isCurrentDay ? 'text-primary' : ''}`}>
                    {formatDateDisplay(date)}
                  </span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-3 space-y-3">
                {/* Add shift button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8"
                  onClick={() => onAddShift(date)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  הוסף משמרת
                </Button>

                {dayShifts.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    <Calendar className="h-6 w-6 mx-auto mb-1 opacity-50" />
                    <span className="text-xs">אין משמרות</span>
                  </div>
                ) : (
                  dayShifts
                    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                    .map(shift => (
                       <div
                         key={shift.id}
                         className="p-3 bg-white border-2 border-border/50 rounded-lg hover:shadow-md hover:border-primary/40 transition-all group"
                       >
                        <div className="space-y-2">
                          {/* Time and branch */}
                          <div 
                            className="cursor-pointer"
                            onClick={() => onShiftClick(shift)}
                          >
                             <div className="flex items-center justify-between mb-1">
                               <div className="flex items-center gap-1 text-xs font-medium">
                                 <Clock className="h-3 w-3 text-gray-500" />
                                 {shift.start_time} - {shift.end_time}
                               </div>
                               {(() => {
                                 const submissionCount = getSubmittedEmployeesForShift(shift).length;
                                 return submissionCount > 0 ? (
                                   <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold min-w-[24px] h-6 flex items-center justify-center shadow-sm">
                                     {submissionCount}
                                   </div>
                                 ) : null;
                               })()}
                             </div>
                           <div className="flex items-center gap-1 text-xs text-foreground font-semibold mb-1">
                             <MapPin className="h-3 w-3 text-primary" />
                             <span className="bg-secondary/80 px-2 py-1 rounded-md border border-border/50 shadow-sm">
                               {getBranchName(shift.branch_id)}
                             </span>
                           </div>
                         </div>

                         {/* Employee assignment section */}
                         <div className="space-y-1">
                            {shift.employee_id ? (
                              <div className="flex items-start gap-1 text-sm p-3 bg-success/10 rounded-md border border-success/20 min-h-[3rem]">
                                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                <span className="text-success font-bold text-wrap break-words leading-relaxed text-base w-full overflow-wrap-anywhere">
                                  {getEmployeeName(shift.employee_id)}
                                </span>
                              </div>
                             ) : onShiftUpdate ? (
                               <div onClick={(e) => e.stopPropagation()}>
                                 <ShiftAssignmentPopover
                                   shift={shift}
                                   employees={employees}
                                   branches={branches}
                                   pendingSubmissions={pendingSubmissions}
                                   onShiftUpdate={onShiftUpdate}
                                 />
                               </div>
                              ) : (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground p-3 bg-muted/30 rounded-md border border-border/50">
                                  <User className="h-4 w-4 shrink-0" />
                                  <span className="font-medium text-base">לא משובץ</span>
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
                              className="text-xs py-0 px-1"
                            >
                              {shift.status === 'assigned' ? 'משובץ' : 
                               shift.status === 'pending' ? 'ממתין' : 
                               shift.status}
                            </Badge>
                            
                            {shift.is_new && (
                              <Badge variant="outline" className="text-xs py-0 px-1 border-blue-500 text-blue-600">
                                חדש
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
