
import React from 'react';
import type { ShiftScheduleViewProps } from './types';

export const YearlyScheduleView: React.FC<ShiftScheduleViewProps> = ({
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
      <h3 className="text-lg font-semibold mb-4">תצוגה שנתית</h3>
      <div className="bg-purple-50 p-4 rounded">
        <p>תצוגת לוח זמנים שנתית - בהכנה</p>
        <p className="text-sm text-gray-600 mt-2">
          משמרות: {shifts.length} | אירועים: {calendarEvents.length}
        </p>
      </div>
    </div>
  );
};
