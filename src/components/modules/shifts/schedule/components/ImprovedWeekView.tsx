
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, User, Clock, MapPin } from 'lucide-react';
import { ShiftAssignmentPopover } from './ShiftAssignmentPopover';
import { format, startOfWeek, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import type { ShiftScheduleData, Employee, Branch } from '../types';

interface ImprovedWeekViewProps {
  shifts: ShiftScheduleData[];
  employees: Employee[];
  branches: Branch[];
  currentWeek: Date;
  pendingSubmissions?: any[];
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
  onAddShift: (date: Date) => void;
}

export const ImprovedWeekView: React.FC<ImprovedWeekViewProps> = ({
  shifts,
  employees,
  branches,
  currentWeek,
  pendingSubmissions = [],
  onShiftClick,
  onShiftUpdate,
  onAddShift
}) => {
  const [assigningShift, setAssigningShift] = useState<string | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  // Group shifts by date
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
    if (!branchId) return 'ללא סניף';
    const branch = branches.find(br => br.id === branchId);
    return branch ? branch.name : 'ללא סניף';
  };

  const handleEmployeeAssignment = async (shiftId: string, employeeId: string) => {
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
    return format(date, 'yyyy-MM-dd');
  };

  const formatDateDisplay = (date: Date) => {
    return format(date, 'dd/MM');
  };

  const isToday = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
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
        {weekDays.map((date, index) => {
          const dateKey = formatDateKey(date);
          const dayShifts = shiftsByDate[dateKey] || [];
          const isCurrentDay = isToday(date);
          
          return (
            <Card 
              key={dateKey} 
              className={`min-h-[400px] lg:min-h-[500px] w-full ${isCurrentDay ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm text-muted-foreground font-medium">{dayNames[index]}</span>
                    <span className={`text-xl font-bold ${isCurrentDay ? 'text-blue-600' : ''}`}>
                      {formatDateDisplay(date)}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Add shift button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full font-medium"
                  onClick={() => onAddShift(date)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  הוסף משמרת
                </Button>

                {/* Shifts for this day */}
                {dayShifts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">אין משמרות</p>
                  </div>
                ) : (
                  dayShifts
                    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                    .map(shift => (
                      <Card
                        key={shift.id}
                        className="p-4 bg-white border border-border hover:shadow-lg transition-shadow cursor-pointer min-h-[120px]"
                        onClick={() => onShiftClick(shift)}
                      >
                        <div className="space-y-3">
                           {/* Time */}
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 text-base font-bold">
                               <Clock className="h-4 w-4 text-primary" />
                               <span className="text-foreground">{shift.start_time} - {shift.end_time}</span>
                             </div>
                               {(() => {
                                 const submissionCount = getSubmittedEmployeesForShift(shift).length;
                                 return submissionCount > 0 ? (
                                   <div className="bg-success text-success-foreground text-sm px-2 py-1 rounded-full font-bold min-w-[24px] h-6 flex items-center justify-center shadow-sm">
                                     {submissionCount}
                                   </div>
                                 ) : null;
                               })()}
                           </div>

                           {/* Branch */}
                           <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                             <MapPin className="h-4 w-4 text-primary" />
                             <span className="bg-secondary px-3 py-2 rounded-md border border-border/50 shadow-sm font-bold">
                               {getBranchName(shift.branch_id)}
                             </span>
                           </div>

                           {/* Employee assignment */}
                           <div className="space-y-2">
                              {shift.employee_id ? (
                                <div className="flex items-start gap-2 text-lg p-4 bg-success/10 rounded-md border border-success/20 min-h-[4rem]">
                                  <User className="h-5 w-5 text-success shrink-0 mt-1" />
                                  <span className="text-success font-bold text-wrap break-words leading-relaxed text-lg w-full overflow-wrap-anywhere">
                                    {getEmployeeName(shift.employee_id)}
                                  </span>
                                </div>
                             ) : (
                               <div onClick={(e) => e.stopPropagation()}>
                                 <ShiftAssignmentPopover
                                   shift={shift}
                                   employees={employees}
                                   branches={branches}
                                   pendingSubmissions={pendingSubmissions}
                                   onShiftUpdate={onShiftUpdate}
                                 />
                               </div>
                             )}
                          </div>

                          {/* Status */}
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
