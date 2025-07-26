
import React from 'react';
import { CompatibleShift, DayShifts } from '@/hooks/useEmployeeCompatibleShifts';
import { DaySection } from './DaySection';

interface ShiftsByDayViewProps {
  shiftsByDay: Record<string, DayShifts>;
  onShiftToggle: (shift: CompatibleShift) => void;
  selectedShifts: CompatibleShift[];
}

export const ShiftsByDayView: React.FC<ShiftsByDayViewProps> = ({
  shiftsByDay,
  onShiftToggle,
  selectedShifts
}) => {
  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  
  return (
    <div className="space-y-6">
      {daysOfWeek.map((dayName) => {
        const dayData = shiftsByDay[dayName];
        if (!dayData) return null;

        return (
          <DaySection
            key={dayName}
            dayName={dayName}
            dayData={dayData}
            onShiftToggle={onShiftToggle}
            selectedShifts={selectedShifts}
          />
        );
      })}
    </div>
  );
};
