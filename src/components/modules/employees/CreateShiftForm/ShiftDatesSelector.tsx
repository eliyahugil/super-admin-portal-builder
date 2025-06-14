
import React from 'react';
import { ShiftDatesSelectorProps } from './types';

export const ShiftDatesSelector: React.FC<ShiftDatesSelectorProps> = ({
  shiftDates,
  onShiftDatesChange,
  submitting
}) => {
  const handleDateAdd = (date: string) => {
    if (!date || shiftDates.includes(date)) return;
    onShiftDatesChange([...shiftDates, date]);
  };

  const handleDateRemove = (dateToRemove: string) => {
    onShiftDatesChange(shiftDates.filter(date => date !== dateToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-600 font-medium">
        תאריך משמרת (ניתן לבחור מספר תאריכים) *
      </label>
      <input
        type="date"
        className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-base"
        value=""
        onChange={e => handleDateAdd(e.target.value)}
        disabled={submitting}
      />
      <div className="flex flex-wrap gap-2">
        {shiftDates.map(date => (
          <span
            key={date}
            className="bg-blue-100 text-blue-700 rounded px-3 py-1 flex items-center gap-1"
          >
            {date}
            <button 
              type="button" 
              onClick={() => handleDateRemove(date)} 
              className="ml-1 text-gray-400 hover:text-red-400"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
