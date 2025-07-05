
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
  holidays,
  shabbatTimes = [],
  onShiftClick
}) => {
  const isMobile = useIsMobile();

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
    return holidays.filter(holiday => holiday.date === dateStr);
  };

  const getShabbatTimesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shabbatTimes.find(times => times.date === dateStr) || null;
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
                {/* Days of week header */}
                {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((dayName) => (
                  <div key={dayName} className="text-center font-medium text-gray-600 p-1">
                    {dayName}
                  </div>
                ))}
                
                {/* Empty cells for days before first day of month */}
                {Array.from({ length: monthData.days[0].getDay() }, (_, i) => (
                  <div key={`empty-${i}`} className="p-1"></div>
                ))}
                
                {/* Days of the month */}
                {monthData.days.map((day) => {
                  const dayShifts = getShiftsForDay(day);
                  const isCurrentDay = isToday(day);
                  const holidaysForDay = getHolidaysForDate(day);
                  const shabbatTimesForDay = getShabbatTimesForDate(day);
                  const hasHoliday = isHoliday(day);
                  const isShabbat = day.getDay() === 6;
                  const isFriday = day.getDay() === 5;
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`p-1 text-center min-h-8 flex flex-col items-center justify-start rounded text-xs ${
                        isCurrentDay ? 'bg-blue-100 text-blue-800 font-bold' : 
                        hasHoliday ? 'bg-green-50 text-green-700' :
                        isShabbat ? 'bg-purple-50 text-purple-700' :
                        isFriday && shabbatTimesForDay ? 'bg-purple-50 text-purple-700' :
                        'text-gray-700'
                      } ${dayShifts.length > 0 ? 'border-2 border-blue-300' : ''}`}
                    >
                      <div className="font-medium">{day.getDate()}</div>
                      
                      {/* Indicators */}
                      {dayShifts.length > 0 && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                      )}
                      
                      {holidaysForDay.length > 0 && (
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                      )}
                      
                      {(isFriday && shabbatTimesForDay?.candleLighting) && (
                        <div className="text-purple-600">🕯️</div>
                      )}
                      
                      {(isShabbat && shabbatTimesForDay?.havdalah) && (
                        <div className="text-blue-600">⭐</div>
                      )}
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
