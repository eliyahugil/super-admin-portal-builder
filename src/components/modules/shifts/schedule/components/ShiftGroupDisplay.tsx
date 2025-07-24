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
  employees?: Array<{ id: string; first_name: string; last_name: string; }>;
  getRoleName?: (roleId: string) => string;
  submissions?: any[];
  allShifts?: ShiftScheduleData[];
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
  onAssignEmployee,
  employees = [],
  getRoleName,
  submissions = [],
  allShifts = []
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
          label: '⏰ כללי',
          color: 'border-gray-400 bg-gradient-to-r from-gray-100 to-gray-50',
          textColor: 'text-gray-800',
          bgColor: 'bg-gray-100',
          separatorColor: 'bg-gray-400'
        };
    }
  };

  const config = getShiftTypeConfig();

  // קיבוץ משמרות לפי סניף
  const shiftsByBranch = shifts.reduce((acc, shift) => {
    const branchName = shift.branch_name || 'ללא סניף';
    if (!acc[branchName]) {
      acc[branchName] = [];
    }
    acc[branchName].push(shift);
    return acc;
  }, {} as Record<string, ShiftScheduleData[]>);

  const branchNames = Object.keys(shiftsByBranch).sort((a, b) => a.localeCompare(b, 'he'));

  // פונקציה לבדיקת הגשות למשמרת ספציפית
  const getShiftSubmissions = (shift: ShiftScheduleData) => {
    console.log('🔍 getShiftSubmissions debug:', {
      shiftId: shift.id,
      shift_date: shift.shift_date,
      start_time: shift.start_time,
      end_time: shift.end_time,
      branch_name: shift.branch_name,
      submissionsCount: submissions.length
    });

    const matchingSubmissions = submissions.filter(sub => {
      // בדיקה שההגשה תואמת לתאריך, שעות וסניף של המשמרת
      const hasMatch = sub.shifts?.some((submittedShift: any) => {
        const matches = {
          date: submittedShift.date === shift.shift_date,
          start_time: submittedShift.start_time === shift.start_time,
          end_time: submittedShift.end_time === shift.end_time,
          branch: submittedShift.branch_preference === shift.branch_name
        };
        
        console.log('📋 Checking submission match:', {
          submittedShift: {
            date: submittedShift.date,
            start_time: submittedShift.start_time,
            end_time: submittedShift.end_time,
            branch_preference: submittedShift.branch_preference
          },
          shift: {
            shift_date: shift.shift_date,
            start_time: shift.start_time,
            end_time: shift.end_time,
            branch_name: shift.branch_name
          },
          matches,
          overallMatch: matches.date && matches.start_time && matches.end_time && matches.branch
        });
        
        return matches.date && matches.start_time && matches.end_time && matches.branch;
      });
      
      return hasMatch;
    });
    
    console.log('✅ getShiftSubmissions result:', {
      shiftId: shift.id,
      matchingCount: matchingSubmissions.length,
      hasSubmissions: matchingSubmissions.length > 0
    });
    
    return {
      hasSubmissions: matchingSubmissions.length > 0,
      submissionsCount: matchingSubmissions.length
    };
  };

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
      {branchNames.map(branchName => (
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
                const endA = parseTime(a.end_time || '23:59');
                const endB = parseTime(b.end_time || '23:59');
                
                // מיון לפי שעת התחלה קודם
                if (startA.totalMinutes !== startB.totalMinutes) {
                  return startA.totalMinutes - startB.totalMinutes;
                }
                
                // אם שעות ההתחלה זהות, מיין לפי שעת הסיום (המשמרת הארוכה יותר קודם)
                return endB.totalMinutes - endA.totalMinutes; // הארוכה קודם
              })
              .map((shift) => {
                const { hasSubmissions, submissionsCount } = getShiftSubmissions(shift);
                return (
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
                    hasSubmissions={hasSubmissions}
                    submissionsCount={submissionsCount}
                    weekStartDate={weekStartDate}
                    onAssignEmployee={onAssignEmployee}
                    employees={employees}
                    getRoleName={getRoleName}
                    submissions={submissions}
                    shifts={allShifts}
                  />
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};