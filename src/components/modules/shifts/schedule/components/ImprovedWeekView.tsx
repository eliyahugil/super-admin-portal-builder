
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, User, Clock, MapPin } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import type { ShiftScheduleData, Employee, Branch } from '../types';

interface ImprovedWeekViewProps {
  shifts: ShiftScheduleData[];
  employees: Employee[];
  branches: Branch[];
  currentWeek: Date;
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
  onAddShift: (date: Date) => void;
}

export const ImprovedWeekView: React.FC<ImprovedWeekViewProps> = ({
  shifts,
  employees,
  branches,
  currentWeek,
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

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {weekDays.map((date, index) => {
          const dateKey = formatDateKey(date);
          const dayShifts = shiftsByDate[dateKey] || [];
          const isCurrentDay = isToday(date);
          
          return (
            <Card 
              key={dateKey} 
              className={`min-h-[300px] ${isCurrentDay ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm text-gray-600">{dayNames[index]}</span>
                    <span className={`text-lg font-bold ${isCurrentDay ? 'text-blue-600' : ''}`}>
                      {formatDateDisplay(date)}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Add shift button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onAddShift(date)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  הוסף משמרת
                </Button>

                {/* Shifts for this day */}
                {dayShifts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">אין משמרות</p>
                  </div>
                ) : (
                  dayShifts
                    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                    .map(shift => (
                      <Card
                        key={shift.id}
                        className="p-3 bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => onShiftClick(shift)}
                      >
                        <div className="space-y-2">
                          {/* Time */}
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Clock className="h-3 w-3 text-gray-500" />
                            {shift.start_time} - {shift.end_time}
                          </div>

                          {/* Branch */}
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="h-3 w-3" />
                            {getBranchName(shift.branch_id)}
                          </div>

                          {/* Employee assignment */}
                          <div className="space-y-1">
                            {shift.employee_id ? (
                              <div className="flex items-center gap-1 text-sm">
                                <User className="h-3 w-3 text-green-600" />
                                <span className="text-green-700 font-medium">
                                  {getEmployeeName(shift.employee_id)}
                                </span>
                              </div>
                            ) : (
                              <div onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value=""
                                  onValueChange={(employeeId) => handleEmployeeAssignment(shift.id, employeeId)}
                                  disabled={assigningShift === shift.id}
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue placeholder={
                                      assigningShift === shift.id ? "משבץ..." : "בחר עובד"
                                    } />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {employees.map(employee => (
                                      <SelectItem key={employee.id} value={employee.id}>
                                        {employee.first_name} {employee.last_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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
