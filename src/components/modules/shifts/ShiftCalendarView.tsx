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
            <div className="grid grid-cols-7 gap-4 mb-6">
            {weekDays.map((day, index) => {
              const dayShifts = getShiftsForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className={`text-center p-4 border-b ${
                    isToday 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700'
                  }`}>
                    <div className="text-sm font-medium mb-1">
                      {dayNames[index]}
                    </div>
                    <div className="text-2xl font-bold">
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  <div className="p-4 min-h-[280px] space-y-3">
                    {dayShifts.length > 0 ? (
                      dayShifts.map((shift) => {
                        const isSelected = isShiftSelected(shift.id);
                        return (
                          <div
                            key={shift.id}
                            onClick={() => onToggleShift(shift.id)}
                            className={`group relative p-4 rounded-lg cursor-pointer border-2 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                              isSelected 
                                ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md' 
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                            
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-green-100">
                                  <Clock className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                  {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                </span>
                              </div>
                              
                              {shift.branches?.name && (
                                <div className="flex items-start gap-2">
                                  <div className="p-1.5 rounded-full bg-blue-100 flex-shrink-0 mt-0.5">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <span className="text-xs text-gray-600 leading-relaxed font-medium" title={shift.branches.name}>
                                    {shift.branches.name}
                                  </span>
                                </div>
                              )}
                              
                              {shift.role && (
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-full bg-purple-100">
                                    <User className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <span className="text-xs text-gray-600 font-medium" title={shift.role}>
                                    {shift.role}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <div className="text-center">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    ✓ נבחר
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <CalendarIcon className="h-6 w-6" />
                        </div>
                        <div className="text-sm font-medium">אין משמרות</div>
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