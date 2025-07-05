
import React from 'react';
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
  return (
    <div className="p-4" dir="rtl">
      <h3 className="text-lg font-semibold mb-4">תצוגה חודשית</h3>
      <div className="bg-green-50 p-4 rounded">
        <p>תצוגת לוח זמנים חודשית - בהכנה</p>
        <p className="text-sm text-gray-600 mt-2">
          משמרות: {shifts.length} | אירועים: {calendarEvents.length}
        </p>
      </div>
    </div>
  );
};
