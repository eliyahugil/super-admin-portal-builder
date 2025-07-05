
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { HolidayIndicator } from './HolidayIndicator';
import { ShabbatIndicator } from './components/ShabbatIndicator';
import { GoogleCalendarFormatter } from '@/services/google-calendar/GoogleCalendarFormatter';
import type { ShiftScheduleViewProps } from './types';

export const WeeklyScheduleView: React.FC<ShiftScheduleViewProps> = ({
  shifts,
  employees,
  currentDate,
  holidays = [],
  shabbatTimes = [],
  onShiftClick,
  onShiftUpdate
}) => {
  const isMobile = useIsMobile();
  const calendarFormatter = new GoogleCalendarFormatter();

  console.log('📅 WeeklyScheduleView - Received data:', {
    holidaysCount: holidays.length,
    shabbatTimesCount: shabbatTimes.length,
    shiftsCount: shifts.length,
    currentWeek: currentDate.toLocaleDateString('he-IL')
  });

  const getWeekDays = () => {
    // Start from Sunday of the current week
    const startOfWeek = new Date(currentDate);
    const currentDay = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startOfWeek.setDate(currentDate.getDate() - currentDay);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(calendarFormatter.formatCalendarDay(day));
    }
    return days;
  };

  const getShiftsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts
      .filter(shift => shift.shift_date === dateStr)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא משוייך';
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'מאושר';
      case 'pending': return 'ממתין';
      case 'rejected': return 'נדחה';
      case 'completed': return 'הושלם';
      default: return status;
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getHolidaysForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const foundHolidays = holidays.filter(holiday => holiday.date === dateStr);
    if (foundHolidays.length > 0) {
      console.log(`🎉 Found holidays for ${dateStr}:`, foundHolidays);
    }
    return foundHolidays;
  };

  const getShabbatTimesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const foundTimes = shabbatTimes.find(times => times.date === dateStr) || null;
    if (foundTimes) {
      console.log(`🕯️ Found Shabbat times for ${dateStr}:`, foundTimes);
    }
    return foundTimes;
  };

  const isHoliday = (date: Date) => {
    return getHolidaysForDate(date).length > 0;
  };

  const weekDays = getWeekDays();

  // Mobile view - vertical cards for each day
  if (isMobile) {
    return (
      <div className="flex flex-col h-full space-y-4" dir="rtl">
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-2">
            {weekDays.map((formattedDay) => {
              const day = formattedDay.gregorianDate;
              const dayShifts = getShiftsForDay(day);
              const isCurrentDay = isToday(day);
              const holidaysForDay = getHolidaysForDate(day);
              const shabbatTimesForDay = getShabbatTimesForDate(day);
              const hasHoliday = isHoliday(day);
              
              return (
                <Card 
                  key={day.toISOString()}
                  className={`p-4 ${isCurrentDay ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'} ${hasHoliday ? 'border-green-300 bg-green-50' : ''}`}
                >
                  {/* Day header */}
                  <div className="mb-4 pb-3 border-b">
                    <div className={`text-lg font-bold ${isCurrentDay ? 'text-blue-600' : hasHoliday ? 'text-green-700' : 'text-gray-900'}`}>
                      {formattedDay.hebrewDayName}
                    </div>
                    <div className={`text-2xl font-bold ${isCurrentDay ? 'text-blue-600' : hasHoliday ? 'text-green-700' : 'text-gray-700'}`}>
                      {day.getDate()}
                    </div>
                    
                    {/* Holiday indicators */}
                    {holidaysForDay.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {holidaysForDay.map((holiday, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            🎉 {holiday.hebrewName}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Shabbat indicators */}
                    <div className="mt-2">
                      <ShabbatIndicator shabbatTimes={shabbatTimesForDay} date={day} variant="detailed" />
                    </div>
                  </div>

                  {/* Shifts for this day */}
                  <div className="space-y-3">
                    {dayShifts.map((shift) => (
                      <Card 
                        key={shift.id}
                        className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-white border border-gray-200 hover:border-blue-300"
                        onClick={() => onShiftClick(shift)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">
                                {calendarFormatter.formatTimeForDisplay(shift.start_time)} - {calendarFormatter.formatTimeForDisplay(shift.end_time)}
                              </span>
                            </div>
                            <Badge 
                              className={`text-xs ${getStatusColor(shift.status)}`}
                              variant="secondary"
                            >
                              {getStatusText(shift.status)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{getEmployeeName(shift.employee_id)}</span>
                          </div>
                          
                          {shift.branch_name && (
                            <div className="text-sm text-gray-600">
                              {shift.branch_name}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                    
                    {dayShifts.length === 0 && (
                      <div className="text-center text-gray-400 text-sm py-6">
                        אין משמרות
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Desktop view - table layout with RTL ordering
  return (
    <div className="flex flex-col h-full">
      {/* Days Headers - Fixed - Hebrew order (Sunday to Saturday, RTL) */}
      <div className="grid grid-cols-7 gap-1 bg-gray-50 sticky top-0 z-10 border-b">
        {weekDays.slice().reverse().map((formattedDay) => {
          const day = formattedDay.gregorianDate;
          const isCurrentDay = isToday(day);
          const holidaysForDay = getHolidaysForDate(day);
          const shabbatTimesForDay = getShabbatTimesForDate(day);
          const hasHoliday = isHoliday(day);
          
          return (
            <div 
              key={day.toISOString()} 
              className={`p-3 text-center border-l border-gray-200 first:border-l-0 ${
                isCurrentDay ? 'bg-blue-50 border-blue-200' : hasHoliday ? 'bg-green-50 border-green-200' : 'bg-gray-50'
              }`}
            >
              <div className="font-medium text-sm text-gray-900">
                {formattedDay.hebrewDayName}
              </div>
              <div className={`text-lg font-bold ${
                isCurrentDay ? 'text-blue-600' : hasHoliday ? 'text-green-700' : 'text-gray-700'
              }`}>
                {day.getDate()}
              </div>
              
              {/* Holiday indicators */}
              {hasHoliday && (
                <div className="mt-1 text-xs text-green-700 font-medium">
                  🎉 {holidaysForDay[0]?.hebrewName}
                </div>
              )}
              
              {/* Shabbat indicators */}
              <div className="mt-1">
                <ShabbatIndicator shabbatTimes={shabbatTimesForDay} date={day} variant="text" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-7 gap-1 min-h-96">
          {weekDays.slice().reverse().map((formattedDay) => {
            const day = formattedDay.gregorianDate;
            const dayShifts = getShiftsForDay(day);
            const hasHoliday = isHoliday(day);
            
            return (
              <div key={day.toISOString()} className={`border-l border-gray-200 first:border-l-0 p-2 ${hasHoliday ? 'bg-green-50' : ''}`}>
                <div className="space-y-2">
                  {dayShifts.map((shift) => (
                    <Card 
                      key={shift.id}
                      className="p-2 cursor-pointer hover:shadow-md transition-shadow bg-white border border-gray-200 hover:border-blue-300"
                      onClick={() => onShiftClick(shift)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>
                            {calendarFormatter.formatTimeForDisplay(shift.start_time)} - {calendarFormatter.formatTimeForDisplay(shift.end_time)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <User className="h-3 w-3" />
                          <span className="truncate font-medium">{getEmployeeName(shift.employee_id)}</span>
                        </div>
                        
                        {shift.branch_name && (
                          <div className="text-xs text-gray-600 truncate">
                            {shift.branch_name}
                          </div>
                        )}
                        
                        <Badge 
                          className={`text-xs ${getStatusColor(shift.status)}`}
                          variant="secondary"
                        >
                          {getStatusText(shift.status)}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                  
                  {dayShifts.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-8">
                      אין משמרות
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
