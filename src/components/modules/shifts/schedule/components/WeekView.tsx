import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import type { ShiftScheduleData, Employee, Branch } from '../types';

interface WeekViewProps {
  shifts: ShiftScheduleData[];
  employees: Employee[];
  branches: Branch[];
  currentDate: Date;
  onShiftClick: (shift: ShiftScheduleData) => void;
  onAddShift: (date: Date) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  shifts,
  employees,
  branches,
  currentDate,
  onShiftClick,
  onAddShift
}) => {
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
    if (!employeeId) return 'לא משויך';
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא ידוע';
  };

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return 'לא משויך';
    const branch = branches.find(br => br.id === branchId);
    return branch ? branch.name : 'לא ידוע';
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

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-4">
        {weekDates.map((date, index) => {
          const dateKey = formatDateKey(date);
          const dayShifts = shiftsByDate[dateKey] || [];
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <Card 
              key={dateKey} 
              className={`min-h-[150px] sm:min-h-[200px] ${isToday ? 'ring-2 ring-primary bg-primary/5' : ''}`}
            >
              <CardHeader className="pb-2 p-2 sm:p-4">
                <CardTitle className="text-sm flex flex-col items-center gap-1">
                  <span className="text-gray-600">{dayNames[index]}</span>
                  <span className={`text-lg ${isToday ? 'text-primary font-bold' : ''}`}>
                    {formatDateDisplay(date)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-2">
                {dayShifts.length === 0 ? (
                  <div 
                    className="text-center py-4 text-gray-400 cursor-pointer hover:bg-gray-50 rounded transition-colors"
                    onClick={() => onAddShift(date)}
                  >
                    <Calendar className="h-6 w-6 mx-auto mb-1 opacity-50" />
                    <span className="text-xs">לחץ להוספת משמרת</span>
                  </div>
                ) : (
                  dayShifts
                    .sort((a, b) => (a.start_time || '').localeCompare(b.end_time || ''))
                    .map(shift => (
                      <div
                        key={shift.id}
                        className="p-2 bg-white border rounded hover:shadow-sm cursor-pointer transition-all"
                        onClick={() => onShiftClick(shift)}
                      >
                        <div className="text-xs font-medium mb-1">
                          {shift.start_time} - {shift.end_time}
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          {getEmployeeName(shift.employee_id)}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {getBranchName(shift.branch_id)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant={
                              shift.status === 'approved' ? 'default' :
                              shift.status === 'pending' ? 'secondary' :
                              'outline'
                            }
                            className="text-xs py-0 px-1"
                          >
                            {shift.status === 'approved' ? 'מאושר' : 
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