import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users } from 'lucide-react';
import { ShiftDisplayCard } from './ShiftDisplayCard';
import type { ShiftScheduleData } from '../types';

interface GroupedShiftDisplayProps {
  shifts: ShiftScheduleData[];
  employees: Array<{ id: string; first_name: string; last_name: string }>;
  branches: Array<{ id: string; name: string }>;
  isSelectionMode: boolean;
  selectedShifts: ShiftScheduleData[];
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftSelection?: (shift: ShiftScheduleData, selected: boolean, event?: React.MouseEvent) => void;
  onDeleteShift: (shiftId: string, event: React.MouseEvent) => void;
  getEmployeeName: (employeeId: string) => string;
  getStatusColor: (status: string) => string;
  hasShiftConflict: (shift: ShiftScheduleData) => boolean;
  isShiftSelected: (shift: ShiftScheduleData) => boolean;
  pendingSubmissions?: Array<any>;
}

interface GroupedShifts {
  [branchId: string]: {
    [timeSlot: string]: ShiftScheduleData[];
  };
}

export const GroupedShiftDisplay: React.FC<GroupedShiftDisplayProps> = ({
  shifts,
  employees,
  branches,
  isSelectionMode,
  selectedShifts,
  onShiftClick,
  onShiftSelection,
  onDeleteShift,
  getEmployeeName,
  getStatusColor,
  hasShiftConflict,
  isShiftSelected,
  pendingSubmissions = []
}) => {
  // קיבוץ משמרות לפי סניף ושעות
  const groupShiftsByBranchAndTime = (): GroupedShifts => {
    const grouped: GroupedShifts = {};
    
    shifts.forEach(shift => {
      const branchId = shift.branch_id || 'unassigned';
      const timeSlot = getTimeSlot(shift.start_time);
      
      if (!grouped[branchId]) {
        grouped[branchId] = {};
      }
      
      if (!grouped[branchId][timeSlot]) {
        grouped[branchId][timeSlot] = [];
      }
      
      grouped[branchId][timeSlot].push(shift);
    });
    
    return grouped;
  };

  // קביעת חלוקת זמנים
  const getTimeSlot = (startTime: string): string => {
    const hour = parseInt(startTime.split(':')[0]);
    
    if (hour >= 6 && hour < 14) {
      return 'morning'; // 06:00-13:59
    } else if (hour >= 14 && hour < 22) {
      return 'evening'; // 14:00-21:59
    } else {
      return 'night'; // 22:00-05:59
    }
  };

  const getTimeSlotLabel = (timeSlot: string): string => {
    switch (timeSlot) {
      case 'morning':
        return 'משמרות בוקר (06:00-14:00)';
      case 'evening':
        return 'משמרות ערב (14:00-22:00)';
      case 'night':
        return 'משמרות לילה (22:00-06:00)';
      default:
        return 'משמרות אחרות';
    }
  };

  const getTimeSlotColor = (timeSlot: string): string => {
    switch (timeSlot) {
      case 'morning':
        return 'border-amber-200 bg-amber-50';
      case 'evening':
        return 'border-orange-200 bg-orange-50';
      case 'night':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getBranchName = (branchId: string): string => {
    if (branchId === 'unassigned') return 'ללא סניף';
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || 'סניף לא ידוע';
  };

  const getShiftSubmissions = (shift: ShiftScheduleData) => {
    const submissions = pendingSubmissions.filter(sub => 
      sub.shift_date === shift.shift_date &&
      sub.start_time === shift.start_time &&
      sub.end_time === shift.end_time
    );
    return {
      hasSubmissions: submissions.length > 0,
      submissionsCount: submissions.length
    };
  };

  const groupedShifts = groupShiftsByBranchAndTime();

  return (
    <div className="space-y-6" dir="rtl">
      {Object.entries(groupedShifts).map(([branchId, timeSlots]) => (
        <Card key={branchId} className="border-2 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
              {getBranchName(branchId)}
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                {Object.values(timeSlots).flat().length} משמרות
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {Object.entries(timeSlots)
              .sort(([a], [b]) => {
                const order = { morning: 1, evening: 2, night: 3 };
                return (order[a as keyof typeof order] || 4) - (order[b as keyof typeof order] || 4);
              })
              .map(([timeSlot, shiftsInSlot]) => (
                <div key={timeSlot} className={`p-4 rounded-lg border ${getTimeSlotColor(timeSlot)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <h3 className="font-medium text-gray-800">{getTimeSlotLabel(timeSlot)}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white">
                        <Users className="h-3 w-3 ml-1" />
                        {shiftsInSlot.length} משמרות
                      </Badge>
                      {shiftsInSlot.some(shift => getShiftSubmissions(shift).hasSubmissions) && (
                        <Badge className="bg-green-600 text-white">
                          יש הגשות
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {shiftsInSlot
                      .sort((a, b) => {
                        // פונקציה למיון לפי שעות
                        const parseTime = (timeStr: string) => {
                          if (!timeStr) return { hours: 0, minutes: 0, totalMinutes: 0 };
                          const parts = timeStr.split(':');
                          const hours = parseInt(parts[0]) || 0;
                          const minutes = parseInt(parts[1]) || 0;
                          return { hours, minutes, totalMinutes: hours * 60 + minutes };
                        };

                        const startA = parseTime(a.start_time || '00:00');
                        const startB = parseTime(b.start_time || '00:00');
                        
                        // מיון לפי שעת התחלה קודם
                        if (startA.totalMinutes !== startB.totalMinutes) {
                          return startA.totalMinutes - startB.totalMinutes;
                        }
                        
                        // אם שעות ההתחלה זהות, מיין לפי שעת הסיום (הקצרה קודם)
                        const endA = parseTime(a.end_time || '23:59');
                        const endB = parseTime(b.end_time || '23:59');
                        
                        return endA.totalMinutes - endB.totalMinutes;
                      })
                      .map(shift => {
                        const { hasSubmissions, submissionsCount } = getShiftSubmissions(shift);
                        const shiftType = timeSlot as 'morning' | 'evening' | 'night';
                        
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
                            employees={employees}
                          />
                        );
                      })}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
      
      {Object.keys(groupedShifts).length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">אין משמרות להצגה</h3>
              <p className="text-sm">לא נמצאו משמרות בתאריך הנבחר</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};