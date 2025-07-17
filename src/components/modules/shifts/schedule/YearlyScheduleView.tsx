
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HolidayIndicator } from './HolidayIndicator';
import { ShabbatIndicator } from './components/ShabbatIndicator';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ShiftScheduleViewProps } from './types';

export const YearlyScheduleView: React.FC<ShiftScheduleViewProps> = ({
  shifts,
  employees,
  currentDate,
  holidays,
  shabbatTimes,
  calendarEvents,
  onShiftClick,
  onShiftUpdate,
  onAddShift,
  onShiftDelete,
  isSelectionMode = false,
  selectedShifts = [],
  onShiftSelection
}) => {
  const isMobile = useIsMobile();

  const hebrewMonthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const yearlyData = useMemo(() => {
    const year = currentDate.getFullYear();
    const monthsData = [];

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      
      // Get shifts for this month
      const monthShifts = shifts.filter(shift => {
        const shiftDate = new Date(shift.shift_date);
        return shiftDate >= monthStart && shiftDate <= monthEnd;
      });

      // Get holidays for this month
      const monthHolidays = holidays.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate >= monthStart && holidayDate <= monthEnd;
      });

      // Get Shabbat times for this month
      const monthShabbats = shabbatTimes.filter(shabbat => {
        const shabbatDate = new Date(shabbat.date);
        return shabbatDate >= monthStart && shabbatDate <= monthEnd;
      });

      // Calculate statistics
      const approvedShifts = monthShifts.filter(s => s.status === 'approved').length;
      const pendingShifts = monthShifts.filter(s => s.status === 'pending').length;
      const assignedShifts = monthShifts.filter(s => s.employee_id).length;

      monthsData.push({
        month,
        monthName: hebrewMonthNames[month],
        monthStart,
        monthEnd,
        shiftsCount: monthShifts.length,
        approvedShifts,
        pendingShifts,
        assignedShifts,
        unassignedShifts: monthShifts.length - assignedShifts,
        holidaysCount: monthHolidays.length,
        shabbatsCount: monthShabbats.length,
        shifts: monthShifts,
        holidays: monthHolidays,
        shabbats: monthShabbats
      });
    }

    return monthsData;
  }, [shifts, holidays, shabbatTimes, currentDate]);

  const yearStats = useMemo(() => {
    return yearlyData.reduce((acc, month) => ({
      totalShifts: acc.totalShifts + month.shiftsCount,
      totalApproved: acc.totalApproved + month.approvedShifts,
      totalPending: acc.totalPending + month.pendingShifts,
      totalHolidays: acc.totalHolidays + month.holidaysCount,
      totalShabbats: acc.totalShabbats + month.shabbatsCount
    }), {
      totalShifts: 0,
      totalApproved: 0,
      totalPending: 0,
      totalHolidays: 0,
      totalShabbats: 0
    });
  }, [yearlyData]);

  const handleMonthClick = (monthData: any) => {
    if (monthData.shifts.length > 0) {
      onShiftClick(monthData.shifts[0]);
    }
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="h-full flex flex-col p-2 space-y-3 overflow-auto" dir="rtl">
        {/* Year Header */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-center">{currentDate.getFullYear()}</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-blue-50 rounded text-center">
                <div className="font-semibold text-blue-800 text-lg">{yearStats.totalShifts}</div>
                <div className="text-blue-600">סה"כ משמרות</div>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <div className="font-semibold text-green-800 text-lg">{yearStats.totalApproved}</div>
                <div className="text-green-600">מאושרות</div>
              </div>
              <div className="p-2 bg-yellow-50 rounded text-center">
                <div className="font-semibold text-yellow-800 text-lg">{yearStats.totalPending}</div>
                <div className="text-yellow-600">ממתינות</div>
              </div>
              <div className="p-2 bg-purple-50 rounded text-center">
                <div className="font-semibold text-purple-800 text-lg">{yearStats.totalHolidays}</div>
                <div className="text-purple-600">חגים</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Cards */}
        {yearlyData.map((monthData) => (
          <Card key={monthData.month} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleMonthClick(monthData)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-center">{monthData.monthName}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {/* Month Statistics */}
              <div className="grid grid-cols-3 gap-1 text-xs">
                <div className="text-center p-1 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-800">{monthData.shiftsCount}</div>
                  <div className="text-gray-600 text-[10px]">משמרות</div>
                </div>
                <div className="text-center p-1 bg-green-50 rounded">
                  <div className="font-semibold text-green-800">{monthData.approvedShifts}</div>
                  <div className="text-green-600 text-[10px]">מאושרות</div>
                </div>
                <div className="text-center p-1 bg-purple-50 rounded">
                  <div className="font-semibold text-purple-800">{monthData.holidaysCount}</div>
                  <div className="text-purple-600 text-[10px]">חגים</div>
                </div>
              </div>

              {/* Special Events */}
              {(monthData.holidaysCount > 0 || monthData.shabbatsCount > 0) && (
                <div className="flex flex-wrap gap-1">
                  {monthData.holidaysCount > 0 && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      {monthData.holidaysCount} חגים
                    </Badge>
                  )}
                  {monthData.shabbatsCount > 0 && (
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                      {monthData.shabbatsCount} שבתות
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto" dir="rtl">
      {/* Year Header with Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">{currentDate.getFullYear()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-800">{yearStats.totalShifts}</div>
              <div className="text-blue-600">סה"כ משמרות</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800">{yearStats.totalApproved}</div>
              <div className="text-green-600">משמרות מאושרות</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-800">{yearStats.totalPending}</div>
              <div className="text-yellow-600">ממתינות לאישור</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-800">{yearStats.totalHolidays}</div>
              <div className="text-purple-600">חגים ומועדים</div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-800">{yearStats.totalShabbats}</div>
              <div className="text-indigo-600">שבתות</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Grid */}
      <div className="grid grid-cols-3 gap-4 flex-1">
        {yearlyData.map((monthData) => (
          <Card key={monthData.month} className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleMonthClick(monthData)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-center">{monthData.monthName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Month Statistics */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-800">{monthData.shiftsCount}</div>
                  <div className="text-gray-600 text-xs">סה"כ משמרות</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-semibold text-green-800">{monthData.approvedShifts}</div>
                  <div className="text-green-600 text-xs">מאושרות</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <div className="font-semibold text-yellow-800">{monthData.pendingShifts}</div>
                  <div className="text-yellow-600 text-xs">ממתינות</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-semibold text-blue-800">{monthData.assignedShifts}</div>
                  <div className="text-blue-600 text-xs">מוקצות</div>
                </div>
              </div>

              {/* Special Events Indicators */}
              {(monthData.holidaysCount > 0 || monthData.shabbatsCount > 0) && (
                <div className="space-y-2">
                  {monthData.holidaysCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700">חגים ומועדים:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {monthData.holidaysCount}
                      </Badge>
                    </div>
                  )}
                  {monthData.shabbatsCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-700">שבתות:</span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {monthData.shabbatsCount}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              {monthData.shiftsCount === 0 && (
                <div className="text-center text-gray-500 text-sm py-2">
                  אין משמרות החודש
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
