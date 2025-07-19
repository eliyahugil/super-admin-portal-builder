import React from 'react';
import { ShiftDisplayCard } from './ShiftDisplayCard';
import type { ShiftScheduleData } from '../types';

interface ShiftGroupDisplayProps {
  shifts: ShiftScheduleData[];
  shiftType: 'morning' | 'evening' | 'night';
  hasOtherShifts: boolean;
  isSelectionMode: boolean;
  selectedShifts: ShiftScheduleData[];
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftSelection?: (shift: ShiftScheduleData, selected: boolean, event?: React.MouseEvent) => void;
  onDeleteShift: (shiftId: string, event: React.MouseEvent) => void;
  getEmployeeName: (employeeId: string) => string;
  getStatusColor: (status: string) => string;
  hasShiftConflict: (shift: ShiftScheduleData) => boolean;
  isShiftSelected: (shift: ShiftScheduleData) => boolean;
  weekStartDate?: string;
  onAssignEmployee?: (employeeId: string, shiftId: string) => void;
}

export const ShiftGroupDisplay: React.FC<ShiftGroupDisplayProps> = ({
  shifts,
  shiftType,
  hasOtherShifts,
  isSelectionMode,
  selectedShifts,
  onShiftClick,
  onShiftSelection,
  onDeleteShift,
  getEmployeeName,
  getStatusColor,
  hasShiftConflict,
  isShiftSelected,
  weekStartDate,
  onAssignEmployee
}) => {
  if (shifts.length === 0) return null;

  const getShiftTypeConfig = () => {
    switch (shiftType) {
      case 'morning':
        return {
          label: '🌅 בוקר',
          color: 'border-amber-400 bg-gradient-to-r from-amber-100 to-amber-50',
          textColor: 'text-amber-800',
          bgColor: 'bg-amber-100',
          separatorColor: 'bg-amber-400'
        };
      case 'evening':
        return {
          label: '🌆 ערב',
          color: 'border-orange-400 bg-gradient-to-r from-orange-100 to-orange-50',
          textColor: 'text-orange-800',
          bgColor: 'bg-orange-100',
          separatorColor: 'bg-orange-400'
        };
      case 'night':
        return {
          label: '🌙 לילה',
          color: 'border-purple-400 bg-gradient-to-r from-purple-100 to-purple-50',
          textColor: 'text-purple-800',
          bgColor: 'bg-purple-100',
          separatorColor: 'bg-purple-400'
        };
      default:
        return {
          label: '',
          color: 'border-gray-300 bg-gray-50',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          separatorColor: 'bg-gray-300'
        };
    }
  };

  const config = getShiftTypeConfig();

  // Group shifts by branch for better organization
  const shiftsByBranch = shifts.reduce((acc, shift) => {
    const branchName = shift.branch_name || 'ללא סניף';
    if (!acc[branchName]) {
      acc[branchName] = [];
    }
    acc[branchName].push(shift);
    return acc;
  }, {} as Record<string, ShiftScheduleData[]>);

  const branchNames = Object.keys(shiftsByBranch).sort((a, b) => a.localeCompare(b, 'he'));

  return (
    <div className="space-y-3">
      {/* הפרדה ויזואלית יפה בין סוגי משמרות */}
      {hasOtherShifts && (
        <div className="flex items-center gap-3 my-4">
          <div className={`flex-1 h-1 rounded-full ${config.separatorColor}`}></div>
          <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-lg ${config.bgColor} ${config.textColor} border-2 border-white`}>
            {config.label}
          </div>
          <div className={`flex-1 h-1 rounded-full ${config.separatorColor}`}></div>
        </div>
      )}

      {/* תצוגה לפי סניפים */}
      {branchNames.map((branchName) => (
        <div key={branchName} className="space-y-2">
          {/* שם הסניף - רק אם יש יותר מסניף אחד ביום זה */}
          {branchNames.length > 1 && (
            <div className="text-sm font-bold text-gray-700 text-center px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm mb-3">
              🏢 {branchName}
            </div>
          )}
          
          {/* משמרות הסניף */}
          <div className="space-y-2">
            {shiftsByBranch[branchName]
              .sort((a, b) => {
                // פונקציה לחילוץ שעה ודקות
                const parseTime = (timeStr: string) => {
                  if (!timeStr) return { hours: 0, minutes: 0, totalMinutes: 0 };
                  const [hours, minutes] = timeStr.split(':').map(num => parseInt(num) || 0);
                  return { hours, minutes, totalMinutes: hours * 60 + minutes };
                };

                const startA = parseTime(a.start_time || '00:00');
                const startB = parseTime(b.start_time || '00:00');
                
                // מיון לפי שעת התחלה קודם
                if (startA.totalMinutes !== startB.totalMinutes) {
                  return startA.totalMinutes - startB.totalMinutes;
                }
                
                // אם שעות ההתחלה זהות, מיין לפי שעת הסיום (המשמרת הארוכה יותר קודם - חובה עד 16:00 לפני תגבור עד 14:00)
                const endA = parseTime(a.end_time || '23:59');
                const endB = parseTime(b.end_time || '23:59');
                
                return endB.totalMinutes - endA.totalMinutes; // הפוך - הארוכה קודם
              })
              .map((shift) => (
                <ShiftDisplayCard
                  key={shift.id}
                  shift={shift}
                  hasConflict={hasShiftConflict(shift)}
                  isSelectionMode={isSelectionMode}
                  isSelected={isShiftSelected(shift)}
                  onShiftClick={onShiftClick}
                  onShiftSelection={onShiftSelection}
                  onDeleteShift={onDeleteShift}
                  getEmployeeName={getEmployeeName}
                  getStatusColor={getStatusColor}
                  shiftType={shiftType}
                  weekStartDate={weekStartDate}
                  onAssignEmployee={onAssignEmployee}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};