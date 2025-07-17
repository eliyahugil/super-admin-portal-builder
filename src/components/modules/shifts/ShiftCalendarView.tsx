import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';

interface Shift {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  role: string;
  status: string;
  branches?: {
    name: string;
    address?: string;
  };
}

interface ShiftCalendarViewProps {
  shifts: Shift[];
  selectedShifts: Record<string, boolean>;
  onToggleShift: (shiftId: string) => void;
  weekStartDate: string;
  weekEndDate: string;
}

export const ShiftCalendarView: React.FC<ShiftCalendarViewProps> = ({
  shifts,
  selectedShifts,
  onToggleShift,
  weekStartDate,
  weekEndDate
}) => {
  const [currentWeekStart] = useState(parseISO(weekStartDate));

  // Get the days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    return addDays(startOfWeek(currentWeekStart, { weekStartsOn: 0 }), i);
  });

  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  // Group shifts by date
  const shiftsByDate = shifts.reduce((acc, shift) => {
    const date = shift.shift_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  const getShiftsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return shiftsByDate[dateStr] || [];
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove seconds if present
  };

  const isShiftSelected = (shiftId: string) => {
    return selectedShifts[shiftId] || false;
  };

  const getSelectedShiftsCount = () => {
    return Object.values(selectedShifts).filter(Boolean).length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              לוח שנה שבועי - משמרות זמינות
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                נבחרו: {getSelectedShiftsCount()} משמרות
              </Badge>
              <div className="text-sm text-gray-600">
                {format(parseISO(weekStartDate), 'dd/MM', { locale: he })} - {format(parseISO(weekEndDate), 'dd/MM', { locale: he })}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* תצוגה למובייל - רשימה */}
          <div className="block md:hidden">
            <div className="space-y-3">
              {shifts.map((shift) => {
                const isSelected = isShiftSelected(shift.id);
                const shiftDate = parseISO(shift.shift_date);
                const dayName = dayNames[shiftDate.getDay()];
                
                return (
                  <div
                    key={shift.id}
                    onClick={() => onToggleShift(shift.id)}
                    className={`p-4 rounded-lg cursor-pointer border transition-all duration-200 hover:shadow-sm ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-300 shadow-sm' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">
                            {dayName}, {format(shiftDate, 'd/M')}
                          </span>
                        </div>
                        {isSelected && (
                          <Badge variant="default" className="text-xs">
                            נבחר ✓
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm">
                          {formatTime(shift.start_time)}-{formatTime(shift.end_time)}
                        </span>
                      </div>
                      
                      {shift.branches?.name && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">
                            {shift.branches.name}
                          </span>
                        </div>
                      )}
                      
                      {shift.role && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">
                            {shift.role}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* תצוגה למחשב - לוח שנה */}
          <div className="hidden md:block">
            <div className="grid grid-cols-7 gap-3 mb-4">
            {weekDays.map((day, index) => {
              const dayShifts = getShiftsForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className={`text-center p-3 rounded-t-lg ${
                    isToday 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    <div className="text-sm font-medium">{dayNames[index]}</div>
                    <div className="text-xl font-bold">{format(day, 'd')}</div>
                  </div>
                  
                  <div className="p-2 min-h-[280px] space-y-2">
                    {dayShifts.length > 0 ? (
                      dayShifts.map((shift) => {
                        const isSelected = isShiftSelected(shift.id);
                        return (
                          <div
                            key={shift.id}
                            onClick={() => onToggleShift(shift.id)}
                            className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 hover:shadow-md ${
                              isSelected 
                                ? 'border-blue-400 bg-blue-50 shadow-md' 
                                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            {/* שעות - בולט ובמרכז */}
                            <div className="text-center mb-2">
                              <span className="text-sm font-bold text-gray-900 bg-white px-2 py-1 rounded border">
                                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                              </span>
                            </div>
                            
                            {/* פרטים נוספים - קומפקטי */}
                            <div className="space-y-1 text-xs">
                              {shift.branches?.name && (
                                <div className="text-center text-gray-700 font-medium" title={shift.branches.name}>
                                  📍 {shift.branches.name}
                                </div>
                              )}
                              
                              {shift.role && (
                                <div className="text-center text-gray-600" title={shift.role}>
                                  👤 {shift.role}
                                </div>
                              )}
                            </div>
                            
                            {/* סימון נבחר */}
                            {isSelected && (
                              <div className="text-center mt-2">
                                <span className="inline-block px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                                  ✓ נבחר
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                        <div className="text-sm">אין משמרות</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">איך להשתמש בלוח השנה:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• לחץ על משמרת כדי לבחור אותה או לבטל את הבחירה</li>
                  <li>• משמרות נבחרות יופיעו עם רקע כחול וסימון ✓</li>
                  <li>• אתה יכול לבחור מספר משמרות מימים שונים</li>
                  <li>• המשמרות מוצגות לפי הסניפים שאתה משויך אליהם</li>
                </ul>
              </div>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};