
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Clock, User, MapPin } from 'lucide-react';
import { HolidayIndicator } from './HolidayIndicator';
import { ShabbatIndicator } from './components/ShabbatIndicator';
import type { ShiftScheduleViewProps } from './types';

export const WeeklyScheduleView: React.FC<ShiftScheduleViewProps> = ({
  shifts,
  employees,
  currentDate,
  holidays,
  shabbatTimes,
  calendarEvents,
  onShiftClick,
  onShiftUpdate
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

  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.shift_date === dateStr);
  };

  const getHolidaysForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.filter(holiday => holiday.date === dateStr);
  };

  const getShabbatForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shabbatTimes.find(shabbat => shabbat.date === dateStr) || null;
  };

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

  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <div className="h-full flex flex-col" dir="rtl">
      <div className="grid grid-cols-7 gap-2 flex-1">
        {weekDays.map((date, index) => {
          const dayShifts = getShiftsForDate(date);
          const dayHolidays = getHolidaysForDate(date);
          const dayShabbat = getShabbatForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isWeekend = index === 5 || index === 6; // Friday or Saturday

          return (
            <Card key={date.toISOString()} className={`flex flex-col min-h-0 ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${isWeekend ? 'text-blue-600' : ''}`}>
                  <div className="flex flex-col items-center">
                    <span>{dayNames[index]}</span>
                    <span className={`text-lg ${isToday ? 'font-bold text-blue-600' : ''}`}>
                      {date.getDate()}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 p-2 space-y-2">
                {/* Holidays */}
                {dayHolidays.length > 0 && (
                  <HolidayIndicator holidays={dayHolidays} variant="badge" />
                )}
                
                {/* Shabbat times */}
                {dayShabbat && (
                  <ShabbatIndicator 
                    shabbatTimes={dayShabbat}
                    date={date}
                    variant="badge"
                  />
                )}
                
                {/* Shifts */}
                <div className="space-y-1">
                  {dayShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="p-2 bg-white border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onShiftClick(shift)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="secondary" className={getStatusColor(shift.status || 'pending')}>
                          {shift.status === 'approved' ? 'מאושר' : 
                           shift.status === 'pending' ? 'ממתין' :
                           shift.status === 'rejected' ? 'נדחה' : 'הושלם'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{shift.start_time} - {shift.end_time}</span>
                        </div>
                        
                        {shift.employee_id && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate">{getEmployeeName(shift.employee_id)}</span>
                          </div>
                        )}
                        
                        {shift.branch_name && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{shift.branch_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Add shift button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => {
                    // This will be handled by the parent component
                    console.log('Add shift for date:', date);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  הוסף משמרת
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
