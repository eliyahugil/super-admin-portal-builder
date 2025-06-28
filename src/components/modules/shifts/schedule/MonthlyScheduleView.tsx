
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ShiftScheduleData, EmployeeData } from './types';

interface MonthlyScheduleViewProps {
  shifts: ShiftScheduleData[];
  employees: EmployeeData[];
  currentDate: Date;
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
}

export const MonthlyScheduleView: React.FC<MonthlyScheduleViewProps> = ({
  shifts,
  employees,
  currentDate,
  onShiftClick
}) => {
  const getMonthCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
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

  const calendar = getMonthCalendar();
  const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  return (
    <div className="flex flex-col h-full">
      {/* Days of week header - Fixed */}
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
              {week.map((day) => {
                const dayShifts = getShiftsForDay(day);
                const isCurrentMonthDay = isCurrentMonth(day);
                const isCurrentDay = isToday(day);
                
                return (
                  <Card 
                    key={day.toISOString()}
                    className={`min-h-24 p-2 ${
                      !isCurrentMonthDay ? 'opacity-30 bg-gray-50' : 'bg-white'
                    } ${
                      isCurrentDay ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    } hover:shadow-sm transition-shadow`}
                  >
                    <div className="space-y-1">
                      <div className={`text-sm font-medium ${
                        isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {day.getDate()}
                      </div>
                      
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
