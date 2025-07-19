import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, User, Plus, FileText, Users } from 'lucide-react';

import type { ShiftScheduleData, Employee, Branch } from '../types';

interface GroupedByBranchViewProps {
  shifts: ShiftScheduleData[];
  employees: Employee[];
  branches: Branch[];
  currentDate: Date;
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
  onAddShift: (date: Date) => void;
  onShiftDelete?: (shiftId: string) => void;
  isSelectionMode?: boolean;
  selectedShifts?: ShiftScheduleData[];
  onShiftSelection?: (shift: ShiftScheduleData, selected: boolean, event?: React.MouseEvent) => void;
  pendingSubmissions?: any[];
  onOpenSubmissions?: () => void;
}

interface GroupedShifts {
  [branchId: string]: {
    branch: Branch;
    days: {
      [date: string]: ShiftScheduleData[];
    };
  };
}

export const GroupedByBranchView: React.FC<GroupedByBranchViewProps> = ({
  shifts,
  employees,
  branches,
  currentDate,
  onShiftClick,
  onShiftUpdate,
  onAddShift,
  onShiftDelete,
  isSelectionMode = false,
  selectedShifts = [],
  onShiftSelection,
  pendingSubmissions = [],
  onOpenSubmissions
}) => {
  // Generate week days starting from Sunday
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentDate]);

  // Group shifts by branch and then by date
  const groupedShifts = useMemo((): GroupedShifts => {
    const grouped: GroupedShifts = {};
    
    // Initialize groups for each branch
    branches.forEach(branch => {
      grouped[branch.id] = {
        branch,
        days: {}
      };
      
      // Initialize each day for this branch
      weekDays.forEach(day => {
        const dateStr = day.toISOString().split('T')[0];
        grouped[branch.id].days[dateStr] = [];
      });
    });
    
    // Group shifts by branch and date
    shifts.forEach(shift => {
      if (shift.branch_id && grouped[shift.branch_id]) {
        const dateStr = shift.shift_date;
        if (grouped[shift.branch_id].days[dateStr]) {
          grouped[shift.branch_id].days[dateStr].push(shift);
        }
      }
    });
    
    // Sort shifts within each day by start time then end time
    Object.values(grouped).forEach(branchGroup => {
      Object.values(branchGroup.days).forEach(dayShifts => {
        dayShifts.sort((a, b) => {
          const parseTime = (timeStr: string) => {
            if (!timeStr) return 0;
            const [hours, minutes] = timeStr.split(':').map(num => parseInt(num) || 0);
            return hours * 60 + minutes;
          };
          
          const startA = parseTime(a.start_time || '00:00');
          const startB = parseTime(b.start_time || '00:00');
          
          // מיון לפי שעת התחלה קודם
          if (startA !== startB) {
            return startA - startB;
          }
          
          // אם שעות ההתחלה זהות, מיין לפי שעת הסיום (הקצרה קודם)
          const endA = parseTime(a.end_time || '23:59');
          const endB = parseTime(b.end_time || '23:59');
          
          return endA - endB;
        });
      });
    });
    
    return grouped;
  }, [shifts, branches, weekDays]);

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא מוקצה';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasShiftConflict = (shift: ShiftScheduleData) => {
    if (!shift.employee_id) return false;
    
    const employeeShifts = shifts.filter(s => 
      s.employee_id === shift.employee_id &&
      s.shift_date === shift.shift_date &&
      s.id !== shift.id
    );
    
    return employeeShifts.some(otherShift => {
      const shiftStart = new Date(`${shift.shift_date}T${shift.start_time}`);
      const shiftEnd = new Date(`${shift.shift_date}T${shift.end_time}`);
      const otherStart = new Date(`${otherShift.shift_date}T${otherShift.start_time}`);
      const otherEnd = new Date(`${otherShift.shift_date}T${otherShift.end_time}`);
      
      return (shiftStart < otherEnd && shiftEnd > otherStart);
    });
  };

  // Group pending submissions by branch and date
  const groupedSubmissions = useMemo(() => {
    const grouped: { [branchId: string]: { [date: string]: any[] } } = {};
    
    branches.forEach(branch => {
      grouped[branch.id] = {};
      weekDays.forEach(day => {
        const dateStr = day.toISOString().split('T')[0];
        grouped[branch.id][dateStr] = [];
      });
    });

    pendingSubmissions.forEach(submission => {
      if (submission.shift_requests && submission.shift_requests.length > 0) {
        submission.shift_requests.forEach((request: any) => {
          if (request.branch_id && grouped[request.branch_id]) {
            const dateStr = request.shift_date;
            if (grouped[request.branch_id][dateStr]) {
              grouped[request.branch_id][dateStr].push({
                ...submission,
                shiftRequest: request
              });
            }
          }
        });
      }
    });

    return grouped;
  }, [pendingSubmissions, branches, weekDays]);

  const isShiftSelected = (shift: ShiftScheduleData) => {
    return selectedShifts.some(s => s.id === shift.id);
  };

  const handleShiftClick = (shift: ShiftScheduleData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSelectionMode && onShiftSelection) {
      const isSelected = isShiftSelected(shift);
      onShiftSelection(shift, !isSelected, e);
    } else {
      onShiftClick(shift);
    }
  };

  // Hebrew day names
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          תצוגה מקובצת לפי סניפים - שבוע {weekDays[0].getDate()}/{weekDays[0].getMonth() + 1}
        </h2>
        <Badge variant="outline" className="text-sm">
          {branches.length} סניפים, {shifts.length} משמרות
        </Badge>
      </div>

      {/* Headers with days */}
      <div className="grid grid-cols-8 gap-2 mb-4">
        <div className="font-semibold text-center text-gray-700 border-b pb-2">
          סניף
        </div>
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const isWeekend = index === 5 || index === 6;
          
          return (
            <div key={day.toISOString()} className={`text-center font-medium border-b pb-2 ${
              isToday ? 'text-blue-600 font-bold' : isWeekend ? 'text-blue-500' : 'text-gray-700'
            }`}>
              <div>{dayNames[index]}</div>
              <div className="text-sm">{day.getDate()}/{day.getMonth() + 1}</div>
            </div>
          );
        })}
      </div>

      {/* Branch rows */}
      <div className="space-y-3">
        {Object.entries(groupedShifts).map(([branchId, branchGroup]) => {
          const totalShifts = Object.values(branchGroup.days).reduce((total, dayShifts) => total + dayShifts.length, 0);
          
          return (
            <Card key={branchId} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-8 gap-2 items-start">
                  {/* Branch name column */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">
                        {branchGroup.branch.name}
                      </h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {totalShifts} משמרות
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddShift(weekDays[0])}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      הוסף
                    </Button>
                  </div>

                   {weekDays.map((day) => {
                     const dateStr = day.toISOString().split('T')[0];
                     const dayShifts = branchGroup.days[dateStr] || [];
                     const daySubmissions = groupedSubmissions[branchId]?.[dateStr] || [];
                     
                     return (
                      <div key={dateStr} className="space-y-1 min-h-[60px]">
                        {dayShifts.map((shift) => (
                          <div
                            key={shift.id}
                            className={`p-2 bg-white border rounded-lg shadow-sm cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all text-xs ${
                              hasShiftConflict(shift) ? 'border-red-300 bg-red-50' : ''
                            } ${isSelectionMode && isShiftSelected(shift) ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' : ''}`}
                            onClick={(e) => handleShiftClick(shift, e)}
                          >
                            {/* Time */}
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span className="font-medium text-gray-700">
                                {shift.start_time}-{shift.end_time}
                              </span>
                            </div>
                            
                            {/* Employee or unassigned */}
                            <div className="text-center">
                              {shift.employee_id ? (
                                <Badge variant="secondary" className="bg-green-50 text-green-700 text-[10px] px-1 py-0.5">
                                  <User className="h-2 w-2 mr-1" />
                                  {getEmployeeName(shift.employee_id).split(' ')[0]}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] px-1 py-0.5">
                                  לא מוקצה
                                </Badge>
                              )}
                            </div>
                            
                            {/* Status */}
                            <div className="text-center mt-1">
                              <Badge variant="secondary" className={`text-[9px] ${getStatusColor(shift.status || 'pending')}`}>
                                {shift.status === 'approved' ? 'מאושר' : 
                                 shift.status === 'pending' ? 'ממתין' :
                                 shift.status === 'rejected' ? 'נדחה' : 'הושלם'}
                              </Badge>
                            </div>
                          </div>
                         ))}
                         
                         {/* Display pending submissions */}
                         {daySubmissions.map((submission, index) => (
                           <div
                             key={`submission-${submission.id}-${index}`}
                             className="p-2 bg-purple-50 border border-purple-200 rounded-lg shadow-sm text-xs cursor-pointer hover:bg-purple-100 hover:border-purple-300 transition-all"
                             onClick={() => onOpenSubmissions && onOpenSubmissions()}
                           >
                             {/* Submission indicator */}
                             <div className="flex items-center justify-center gap-1 mb-1">
                               <FileText className="h-3 w-3 text-purple-600" />
                               <span className="font-medium text-purple-700">
                                 הגשה ממתינה
                               </span>
                             </div>
                             
                             {/* Employee name */}
                             <div className="text-center mb-1">
                               <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-[10px] px-1 py-0.5">
                                 <User className="h-2 w-2 mr-1" />
                                 {getEmployeeName(submission.employee_id)?.split(' ')[0] || 'לא ידוע'}
                               </Badge>
                             </div>
                             
                             {/* Shift details from request */}
                             {submission.shiftRequest && (
                               <div className="text-center">
                                 <div className="text-[9px] text-purple-600 mb-1">
                                   {submission.shiftRequest.start_time}-{submission.shiftRequest.end_time}
                                 </div>
                                 <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[9px] px-1 py-0.5">
                                   {submission.shiftRequest.role || 'כללי'}
                                 </Badge>
                               </div>
                             )}
                             
                             {/* Click instruction */}
                             <div className="text-center mt-1">
                               <span className="text-[8px] text-purple-500">לחץ לפתיחת חלון שיבוץ</span>
                             </div>
                           </div>
                         ))}
                         
                         {/* Add shift button for empty days */}
                         {dayShifts.length === 0 && daySubmissions.length === 0 && (
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => onAddShift(day)}
                             className="w-full h-10 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600"
                           >
                             <Plus className="h-3 w-3" />
                           </Button>
                         )}
                       </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                סה"כ {shifts.length} משמרות
              </Badge>
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                {shifts.filter(s => s.employee_id).length} מוקצות
              </Badge>
              <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                {shifts.filter(s => !s.employee_id).length} לא מוקצות
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-purple-50 text-purple-700 cursor-pointer hover:bg-purple-100 transition-colors"
                onClick={() => onOpenSubmissions && onOpenSubmissions()}
              >
                <FileText className="h-3 w-3 mr-1" />
                {pendingSubmissions.length} הגשות ממתינות
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              תצוגה מקובצת לפי {branches.length} סניפים
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};