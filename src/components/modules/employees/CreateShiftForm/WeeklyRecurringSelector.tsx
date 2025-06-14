
import React from 'react';
import { WeekdaySelector } from './WeekdaySelector';
import { WeeklyRecurringSelectorProps } from './types';

export const WeeklyRecurringSelector: React.FC<WeeklyRecurringSelectorProps> = ({
  weekdayRange,
  selectedWeekdays,
  onWeekdayRangeChange,
  onSelectedWeekdaysChange,
  submitting
}) => {
  return (
    <div className="space-y-2 bg-blue-50 rounded-xl p-3">
      <WeekdaySelector
        selectedWeekdays={selectedWeekdays}
        onChange={onSelectedWeekdaysChange}
        disabled={submitting}
      />
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <div>
          <label className="text-xs text-gray-600">מתאריך</label>
          <input
            type="date"
            value={weekdayRange.start}
            onChange={e => onWeekdayRangeChange({...weekdayRange, start: e.target.value})}
            className="border rounded-xl p-2 ml-2"
            disabled={submitting}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">עד תאריך</label>
          <input
            type="date"
            value={weekdayRange.end}
            onChange={e => onWeekdayRangeChange({...weekdayRange, end: e.target.value})}
            className="border rounded-xl p-2"
            disabled={submitting}
          />
        </div>
        {selectedWeekdays.length === 0 && (weekdayRange.start || weekdayRange.end) && (
          <span className="text-xs text-red-400 mr-4">יש לבחור לפחות יום אחד</span>
        )}
      </div>
    </div>
  );
};
