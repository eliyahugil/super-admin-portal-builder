
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar as CalendarIcon } from 'lucide-react';
import { HolidayIndicator } from './HolidayIndicator';
import { ShabbatIndicator } from './components/ShabbatIndicator';
import type { ShiftScheduleViewProps } from './types';

export const YearlyScheduleView: React.FC<ShiftScheduleViewProps> = ({
  shifts,
  employees,
  currentDate,
  holidays = [],
  shabbatTimes = [],
  onShiftClick
}) => {
  const isMobile = useIsMobile();

  console.log('📅 YearlyScheduleView - Received data:', {
    holidaysCount: holidays.length,
    shabbatTimesCount: shabbatTimes.length,
    shiftsCount: shifts.length,
    currentYear: currentDate.getFullYear()
  });

  const getYearCalendar = () => {
    const year = currentDate.getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      
      const monthData = {
        name: firstDay.toLocaleDateString('he-IL', { month: 'long' }),
        month: month,
        days: []
      };
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        monthData.days.push(date);
      }
      
      months.push(monthData);
    }
    
    return months;
  };

  const getShiftsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.shift_date === dateStr);
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

  const yearCalendar = getYearCalendar();

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <ScrollArea className="flex-1">
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-6'} p-4`}>
          {yearCalendar.map((monthData) => (
            <Card key={monthData.month} className="p-4">
              <h3 className="text-lg font-bold text-center mb-4 text-gray-800">
                {monthData.name}
              </h3>
              
              <div className="grid grid-cols-7 gap-1 text-xs">
                {/* Days of week header - Sunday to Saturday (right to left for Hebrew) */}
                {['שבת', 'ו', 'ה', 'ד', 'ג', 'ב', 'א'].map((dayName) => (
                  <div key={dayName} className="text-center font-medium text-gray-600 p-1">
                    {dayName}
                  </div>
                ))}
                
                {/* Empty cells for days before first day of month - adjust for RTL */}
                {Array.from({ length: (7 - monthData.days[0].getDay()) % 7 }, (_, i) => (
                  <div key={`empty-${i}`} className="p-1"></div>
                ))}
                
                {/* Days of the month */}
                {monthData.days.map((day) => {
                  const dayShifts = getShiftsForDay(day);
                  const isCurrentDay = isToday(day);
                  const holidaysForDay = getHolidaysForDate(day);
                  const shabbatTimesForDay = getShabbatTimesForDate(day);
                  const hasHoliday = holidaysForDay.length > 0;
                  const isShabbat = day.getDay() === 6;
                  const isFriday = day.getDay() === 5;
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`p-1 text-center min-h-12 flex flex-col items-center justify-start rounded text-xs relative ${
                        isCurrentDay ? 'bg-blue-100 text-blue-800 font-bold border-2 border-blue-300' : 
                        hasHoliday ? 'bg-green-100 text-green-700 border border-green-300' :
                        isShabbat ? 'bg-purple-50 text-purple-700' :
                        isFriday && shabbatTimesForDay ? 'bg-purple-50 text-purple-700' :
                        'text-gray-700 hover:bg-gray-50'
                      } ${dayShifts.length > 0 ? 'ring-2 ring-blue-400' : ''}`}
                      title={`${day.getDate()} ${monthData.name}${hasHoliday ? ` - ${holidaysForDay[0]?.hebrewName}` : ''}`}
                    >
                      <div className="font-medium mb-1">{day.getDate()}</div>
                      
                      {/* Indicators container */}
                      <div className="flex flex-col items-center space-y-1 w-full">
                        {/* Holiday indicator */}
                        {hasHoliday && (
                          <div className="text-xs text-green-700 font-bold text-center leading-tight">
                            🎉
                          </div>
                        )}
                        
                        {/* Shift indicator */}
                        {dayShifts.length > 0 && (
                          <div className="text-xs text-blue-600 font-bold">
                            {dayShifts.length}
                          </div>
                        )}
                        
                        {/* Shabbat indicators */}
                        {isFriday && shabbatTimesForDay?.candleLighting && (
                          <div className="text-xs text-purple-600 text-center">
                            🕯️
                          </div>
                        )}
                        
                        {isShabbat && shabbatTimesForDay?.havdalah && (
                          <div className="text-xs text-blue-600 text-center">
                            ⭐
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
