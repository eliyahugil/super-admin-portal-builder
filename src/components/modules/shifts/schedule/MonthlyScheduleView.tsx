import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar as CalendarIcon } from 'lucide-react';
import { HolidayIndicator } from './HolidayIndicator';
import { ShabbatIndicator } from './components/ShabbatIndicator';
import type { ShiftScheduleViewProps } from './types';

export const MonthlyScheduleView: React.FC<ShiftScheduleViewProps> = ({
  shifts,
  employees,
  currentDate,
  holidays = [],
  shabbatTimes = [],
  onShiftClick
}) => {
  const isMobile = useIsMobile();

  console.log('📅 MonthlyScheduleView - Received data:', {
    holidaysCount: holidays.length,
    shabbatTimesCount: shabbatTimes.length,
    shiftsCount: shifts.length,
    currentMonth: currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
  });

  const getMonthCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Sunday (day 0) - in Hebrew calendar, Sunday is the first day
    const startDate = new Date(firstDay);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startDate.setDate(firstDay.getDate() - firstDayOfWeek);
    
    const calendar = [];
    let currentWeek = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      currentWeek.push(date);
      
      if (currentWeek.length === 7) {
        calendar.push(currentWeek);
        currentWeek = [];
      }
    }
    
    return calendar;
  };

  const getShiftsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.shift_date === dateStr);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
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

  // Helper function to get Hebrew day name based on day.getDay()
  const getHebrewDayName = (dayIndex: number) => {
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return dayNames[dayIndex];
  };

  const calendar = getMonthCalendar();
  // Order: Sunday to Saturday (right to left in Hebrew) - header order reversed for RTL
  const dayNames = ['שבת', 'שישי', 'חמישי', 'רביעי', 'שלישי', 'שני', 'ראשון'];

  // Mobile view - list of days with shifts
  if (isMobile) {
    const daysWithShifts = calendar.flat()
      .filter(day => isCurrentMonth(day) && (getShiftsForDay(day).length > 0 || getHolidaysForDate(day).length > 0 || getShabbatTimesForDate(day) !== null))
      .sort((a, b) => a.getTime() - b.getTime());

    return (
      <div className="flex flex-col h-full" dir="rtl">
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-2">
            {daysWithShifts.map((day) => {
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
                      {getHebrewDayName(day.getDay())}
                    </div>
                    <div className={`text-2xl font-bold ${isCurrentDay ? 'text-blue-600' : hasHoliday ? 'text-green-700' : 'text-gray-700'}`}>
                      {day.getDate()} {day.toLocaleDateString('he-IL', { month: 'long' })}
                    </div>
                    
                    {/* Holiday and Shabbat indicators */}
                    <div className="mt-2 space-y-2">
                      {holidaysForDay.length > 0 && (
                        <div className="space-y-1">
                          {holidaysForDay.map((holiday, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                              🎉 {holiday.hebrewName}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <ShabbatIndicator shabbatTimes={shabbatTimesForDay} date={day} variant="detailed" />
                    </div>
                  </div>

                  {/* Shifts for this day */}
                  <div className="space-y-2">
                    {dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="p-3 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                        onClick={() => onShiftClick(shift)}
                      >
                        <div className="font-medium">
                          {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                        </div>
                        {shift.branch_name && (
                          <div className="text-sm opacity-80">
                            {shift.branch_name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}

            {daysWithShifts.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                אין משמרות, חגים או זמני שבת מתוכננים לחודש זה
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Desktop view - calendar grid
  return (
    <div className="flex flex-col h-full">
      {/* Days of week header - Fixed - Sunday to Saturday (right to left for Hebrew) */}
      <div className="grid grid-cols-7 gap-1 mb-2 bg-gray-50 sticky top-0 z-10">
        {dayNames.map((dayName) => (
          <div key={dayName} className="p-2 text-center font-medium text-gray-600 bg-gray-50 rounded">
            {dayName}
          </div>
        ))}
      </div>
      
      {/* Scrollable Calendar grid */}
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {calendar.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.slice().reverse().map((day) => {
                const dayShifts = getShiftsForDay(day);
                const isCurrentMonthDay = isCurrentMonth(day);
                const isCurrentDay = isToday(day);
                const holidaysForDay = getHolidaysForDate(day);
                const shabbatTimesForDay = getShabbatTimesForDate(day);
                const hasHoliday = isHoliday(day);
                const isShabbat = day.getDay() === 6;
                const isFriday = day.getDay() === 5;
                
                return (
                  <Card 
                    key={day.toISOString()}
                    className={`min-h-32 p-2 ${
                      !isCurrentMonthDay ? 'opacity-30 bg-gray-50' : 'bg-white'
                    } ${
                      isCurrentDay ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    } ${
                      hasHoliday ? 'border-green-300 bg-green-50' : ''
                    } hover:shadow-sm transition-shadow`}
                  >
                    <div className="space-y-1">
                      <div className={`text-sm font-medium flex justify-between items-center ${
                        isCurrentDay ? 'text-blue-600' : hasHoliday ? 'text-green-700' : 'text-gray-900'
                      }`}>
                        <span>{day.getDate()}</span>
                        <span className="text-xs text-gray-500">{getHebrewDayName(day.getDay())}</span>
                      </div>
                      
                      {/* Holiday indicators */}
                      {hasHoliday && (
                        <div className="space-y-1">
                          {holidaysForDay.slice(0, 1).map((holiday, index) => (
                            <div key={index} className="text-xs text-green-700 font-medium leading-tight">
                              🎉 {holiday.hebrewName}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Shabbat times display for Friday and Saturday */}
                      {isFriday && shabbatTimesForDay?.candleLighting && (
                        <div className="text-xs text-purple-700 font-medium">
                          🕯️ כניסת שבת: {shabbatTimesForDay.candleLighting}
                        </div>
                      )}
                      
                      {isShabbat && shabbatTimesForDay?.havdalah && (
                        <div className="text-xs text-blue-700 font-medium">
                          ⭐ יציאת שבת: {shabbatTimesForDay.havdalah}
                        </div>
                      )}
                      
                      <div className="space-y-1 max-h-16 overflow-hidden">
                        {dayShifts.slice(0, 2).map((shift) => (
                          <div
                            key={shift.id}
                            className="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                            onClick={() => onShiftClick(shift)}
                          >
                            {shift.start_time.slice(0, 5)}
                          </div>
                        ))}
                        
                        {dayShifts.length > 2 && (
                          <div className="text-xs text-gray-500 font-medium">
                            +{dayShifts.length - 2} עוד
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
