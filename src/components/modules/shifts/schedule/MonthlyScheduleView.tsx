
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { HolidayIndicator } from './HolidayIndicator';
import { ShabbatIndicator } from './components/ShabbatIndicator';
import type { ShiftScheduleViewProps } from './types';

export const MonthlyScheduleView: React.FC<ShiftScheduleViewProps> = ({
  shifts,
  employees,
  currentDate,
  holidays,
  shabbatTimes,
  calendarEvents,
  onShiftClick,
  onShiftUpdate
}) => {
  const monthShifts = useMemo(() => {
    const shiftsMap = new Map();
    shifts.forEach(shift => {
      const date = shift.shift_date;
      if (!shiftsMap.has(date)) {
        shiftsMap.set(date, []);
      }
      shiftsMap.get(date).push(shift);
    });
    return shiftsMap;
  }, [shifts]);

  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return monthShifts.get(dateStr) || [];
  };

  const getHolidaysForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.filter(holiday => holiday.date === dateStr);
  };

  const getShabbatForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shabbatTimes.find(shabbat => shabbat.date === dateStr) || null;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dayShifts = getShiftsForDate(date);
      if (dayShifts.length > 0) {
        onShiftClick(dayShifts[0]);
      }
    }
  };

  const hebrewMonthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const currentMonthName = hebrewMonthNames[currentDate.getMonth()];

  return (
    <div className="h-full flex gap-4" dir="rtl">
      {/* Calendar */}
      <Card className="flex-1">
        <CardHeader>
          <h3 className="text-lg font-semibold text-center">
            {currentMonthName} {currentDate.getFullYear()}
          </h3>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleDateSelect}
            className="w-full"
            dir="rtl"
            locale={{
              localize: {
                day: (n: number) => {
                  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                  return days[n];
                },
                month: (n: number) => hebrewMonthNames[n]
              },
              formatLong: {},
              match: {}
            } as any}
            modifiers={{
              hasShifts: (date) => getShiftsForDate(date).length > 0,
              isHoliday: (date) => getHolidaysForDate(date).length > 0,
              isShabbat: (date) => date.getDay() === 6
            }}
            modifiersStyles={{
              hasShifts: { backgroundColor: '#dbeafe', fontWeight: 'bold' },
              isHoliday: { backgroundColor: '#dcfce7', color: '#166534' },
              isShabbat: { backgroundColor: '#f3e8ff', color: '#7c3aed' }
            }}
          />
        </CardContent>
      </Card>

      {/* Side panel with details */}
      <Card className="w-80">
        <CardHeader>
          <h3 className="text-lg font-semibold">פרטי היום</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">בחר תאריך בלוח השנה לצפייה בפרטים</p>
          </div>
          
          {/* Statistics */}
          <div className="space-y-2">
            <h4 className="font-semibold">סטטיסטיקות חודשיות</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-blue-50 rounded text-center">
                <div className="font-semibold text-blue-800 text-lg">{shifts.length}</div>
                <div className="text-blue-600 text-xs">סה"כ משמרות</div>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <div className="font-semibold text-green-800 text-lg">
                  {shifts.filter(s => s.status === 'approved').length}
                </div>
                <div className="text-green-600 text-xs">משמרות מאושרות</div>
              </div>
              <div className="p-2 bg-yellow-50 rounded text-center">
                <div className="font-semibold text-yellow-800 text-lg">
                  {shifts.filter(s => s.status === 'pending').length}
                </div>
                <div className="text-yellow-600 text-xs">ממתינות לאישור</div>
              </div>
              <div className="p-2 bg-purple-50 rounded text-center">
                <div className="font-semibold text-purple-800 text-lg">{holidays.length}</div>
                <div className="text-purple-600 text-xs">חגים ומועדים</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
