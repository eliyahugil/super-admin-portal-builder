import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, User, Plus, FileText, Users, Edit, Zap } from 'lucide-react';
import { ScheduleStats } from './ScheduleStats';
import { EmployeeStatsPanel } from '../EmployeeStatsPanel';
import { AutoAssignmentHelper } from './AutoAssignmentHelper';

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
          // Enhanced time parsing with validation
          const parseTime = (timeStr: string) => {
            if (!timeStr || typeof timeStr !== 'string') {
              return 0;
            }
            
            const parts = timeStr.split(':');
            if (parts.length !== 2) {
              return 0;
            }
            
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            const totalMinutes = hours * 60 + minutes;
            
            return totalMinutes;
          };
          
          const startA = parseTime(a.start_time);
          const startB = parseTime(b.start_time);
          
          // Primary sort: by start time (earliest first)
          if (startA !== startB) {
            return startA - startB;
          }
          
          // Secondary sort: if start times are identical, sort by end time (longer shifts first)
          const endA = parseTime(a.end_time);
          const endB = parseTime(b.end_time);
          return endB - endA;
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
      // פותח את פרטי המשמרת עם הגשות רלוונטיות
      onShiftClick(shift);
    }
  };

  const handleEditShift = (shift: ShiftScheduleData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShiftClick(shift);
  };

  const handleAutoAssign = (shiftId: string, employeeId: string) => {
    onShiftUpdate(shiftId, { employee_id: employeeId });
  };

  const handleUnassign = (shiftId: string) => {
    onShiftUpdate(shiftId, { employee_id: null });
  };

  // Hebrew day names
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">
          תצוגה לפי סניפים - שבוע {weekDays[0].getDate()}/{weekDays[0].getMonth() + 1}
        </h2>
        <Badge variant="outline" className="text-sm w-fit">
          {branches.length} סניפים, {shifts.length} משמרות
        </Badge>
      </div>

      {/* Statistics Panel */}
      <div className="hidden md:block">
        <ScheduleStats shifts={shifts} isMobile={false} pendingSubmissions={pendingSubmissions} />
      </div>
      
      {/* Mobile/Desktop responsive layout */}
      <div className="block md:hidden">
        {/* Mobile Layout - Card per branch */}
        <div className="space-y-4">
          {Object.entries(groupedShifts).map(([branchId, branchGroup]) => {
            const totalShifts = Object.values(branchGroup.days).reduce((total, dayShifts) => total + dayShifts.length, 0);
            
            return (
              <Card key={branchId} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    {branchGroup.branch.name}
                    <Badge variant="secondary" className="text-xs">
                      {totalShifts} משמרות
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {weekDays.map((day, dayIndex) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const dayShifts = branchGroup.days[dateStr] || [];
                    const daySubmissions = groupedSubmissions[branchId]?.[dateStr] || [];
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isWeekend = dayIndex === 5 || dayIndex === 6;
                    
                    if (dayShifts.length === 0 && daySubmissions.length === 0) return null;
                    
                    return (
                      <div key={dateStr} className="space-y-2">
                        {/* Day Header */}
                        <div className={`text-sm font-medium px-2 py-1 rounded ${
                          isToday ? 'bg-blue-100 text-blue-700' : 
                          isWeekend ? 'bg-gray-100 text-blue-600' : 'bg-gray-50 text-gray-700'
                        }`}>
                          {dayNames[dayIndex]} {day.getDate()}/{day.getMonth() + 1}
                        </div>
                        
                        {/* Shifts for this day */}
                        <div className="space-y-2">
                          {dayShifts.map((shift) => (
                            <div key={shift.id} className="bg-white border rounded-lg p-3 shadow-sm">
                              {/* Top row: Time and status */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium text-gray-900">
                                    {shift.start_time} - {shift.end_time}
                                  </span>
                                </div>
                                <Badge variant="secondary" className={`text-xs ${getStatusColor(shift.status || 'pending')}`}>
                                  {shift.status === 'approved' ? 'מאושר' : 
                                   shift.status === 'pending' ? 'ממתין' :
                                   shift.status === 'rejected' ? 'נדחה' : 'הושלם'}
                                </Badge>
                              </div>
                              
                              {/* Employee assignment */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-700">
                                    {shift.employee_id ? getEmployeeName(shift.employee_id) : 'לא משוייך'}
                                  </span>
                                </div>
                                {shift.employee_id && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUnassign(shift.id)}
                                    className="text-xs py-1 px-2 h-6"
                                  >
                                    הסר שיוך
                                  </Button>
                                )}
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => handleEditShift(shift, e)}
                                  className="text-xs flex-1"
                                >
                                  <Edit className="h-3 w-3 ml-1" />
                                  ערוך
                                </Button>
                                {!shift.employee_id && (
                                  <AutoAssignmentHelper
                                    shift={shift}
                                    employees={employees}
                                    existingShifts={shifts}
                                    pendingSubmissions={pendingSubmissions}
                                    onAutoAssign={handleAutoAssign}
                                    onUnassign={handleUnassign}
                                  />
                                )}
                                {onShiftDelete && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => onShiftDelete(shift.id)}
                                    className="text-xs px-2"
                                  >
                                    מחק
                                  </Button>
                                )}
                              </div>
                              
                              {/* Conflict warning */}
                              {hasShiftConflict(shift) && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                  ⚠️ זוהתה התנגשות בזמנים
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Pending submissions */}
                          {daySubmissions.map((submission, index) => (
                            <div
                              key={`submission-${submission.id}-${index}`}
                              className="bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer hover:bg-green-100"
                              onClick={() => onOpenSubmissions && onOpenSubmissions()}
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">
                                  הגשת משמרת - {submission.employee?.first_name} {submission.employee?.last_name}
                                </span>
                              </div>
                              <div className="text-xs text-green-600 mt-1">
                                {submission.shiftRequest?.start_time} - {submission.shiftRequest?.end_time}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Add shift button */}
                  <Button
                    variant="outline"
                    onClick={() => onAddShift(weekDays[0])}
                    className="w-full mt-3"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    הוסף משמרת לסניף
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Desktop Layout - Grid */}
      <div className="hidden md:block">
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
                        <h3 className="font-semibold text-gray-900 text-sm">
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
                        <div key={dateStr} className="space-y-1 min-h-[80px]">
                          {dayShifts.map((shift) => (
                            <div key={shift.id} className="group">
                              <div
                                className={`relative p-2 bg-white border rounded-lg shadow-sm cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all text-xs ${
                                  hasShiftConflict(shift) ? 'border-red-300 bg-red-50' : ''
                                } ${isSelectionMode && isShiftSelected(shift) ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' : ''}`}
                                onClick={(e) => handleShiftClick(shift, e)}
                              >
                                {/* Quick actions - visible on hover */}
                                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 p-0 bg-white hover:bg-gray-100 shadow-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditShift(shift, e);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  {shift.employee_id && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-5 w-5 p-0 bg-white hover:bg-red-100 shadow-sm text-red-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUnassign(shift.id);
                                      }}
                                      title="הסר שיוך עובד"
                                    >
                                      ✕
                                    </Button>
                                  )}
                                </div>

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
                              
                              {/* Auto Assignment Helper for unassigned shifts */}
                              {!shift.employee_id && (
                                <div className="mt-1">
                                  <AutoAssignmentHelper
                                    shift={shift}
                                    employees={employees}
                                    existingShifts={shifts}
                                    pendingSubmissions={pendingSubmissions}
                                    onAutoAssign={handleAutoAssign}
                                    onUnassign={handleUnassign}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Display pending submissions */}
                          {daySubmissions.map((submission, index) => (
                            <div
                              key={`submission-${submission.id}-${index}`}
                              className="p-2 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors text-xs"
                              onClick={() => onOpenSubmissions && onOpenSubmissions()}
                              title="לחץ לפתיחת הגשות ממתינות"
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <FileText className="h-3 w-3 text-green-600" />
                                <span className="font-medium text-green-700">
                                  הגשה
                                </span>
                              </div>
                              <div className="text-green-600">
                                {submission.employee?.first_name}
                              </div>
                              <div className="text-green-500 text-[10px]">
                                {submission.shiftRequest?.start_time}-{submission.shiftRequest?.end_time}
                              </div>
                            </div>
                          ))}
                          
                          {/* Empty state for days with no shifts */}
                          {dayShifts.length === 0 && daySubmissions.length === 0 && (
                            <div className="flex items-center justify-center h-16">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onAddShift(day)}
                                className="text-xs text-gray-400 hover:text-gray-600"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
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
      </div>
      
      {/* Employee Statistics Panel */}
      <div className="hidden md:block">
        <EmployeeStatsPanel 
          shifts={shifts}
          employees={employees}
          branches={branches}
          weekRange={{
            start: weekDays[0],
            end: weekDays[6]
          }}
          businessId={shifts[0]?.business_id || ''}
        />
      </div>
    </div>
  );
};