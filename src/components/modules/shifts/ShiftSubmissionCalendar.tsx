
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, MapPin, Users, Plus, Minus, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getUpcomingWeekDates } from '@/lib/dateUtils';

interface SelectedShift {
  date: Date;
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  branchName: string;
}

interface ShiftSubmissionCalendarProps {
  businessId: string;
  onSubmit: (shifts: SelectedShift[]) => void;
  onVacationRequest: () => void;
  submitting?: boolean;
  weekRange?: {
    start: Date;
    end: Date;
  };
}

interface AvailableShift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  branch_name: string;
  branch_id: string;
  date: string;
  max_employees: number;
  current_employees: number;
}

export const ShiftSubmissionCalendar: React.FC<ShiftSubmissionCalendarProps> = ({
  businessId,
  onSubmit,
  onVacationRequest,
  submitting = false,
  weekRange
}) => {
  const [selectedShifts, setSelectedShifts] = useState<SelectedShift[]>([]);
  const [selectedSpecialShifts, setSelectedSpecialShifts] = useState<SelectedShift[]>([]);
  const [showSpecialShifts, setShowSpecialShifts] = useState<boolean>(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    if (weekRange) return weekRange.start;
    
    // Use upcoming week as default
    const upcomingWeek = getUpcomingWeekDates();
    return upcomingWeek.startDate;
  });
  
  // For demo purposes, assume user is an evening worker
  // In real app, this would come from user preferences/profile
  const [employeePreference] = useState<'morning' | 'evening'>('evening');
  
  const { toast } = useToast();

  // Get week dates
  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  // Fetch available shifts for the week
  const { data: availableShifts = [], isLoading } = useQuery({
    queryKey: ['available-shifts', businessId, currentWeekStart.toISOString()],
    queryFn: async () => {
      const startDate = currentWeekStart.toISOString().split('T')[0];
      const endDate = new Date(currentWeekStart);
      endDate.setDate(currentWeekStart.getDate() + 6);
      const endDateStr = endDate.toISOString().split('T')[0];

      // This is a mock implementation - in a real app you'd fetch from shifts table
      // For now, generate some sample shifts
      const shifts: AvailableShift[] = [];
      
      weekDates.forEach((date, dayIndex) => {
        // Skip if we have week range restrictions and date is outside range
        if (weekRange && (date < weekRange.start || date > weekRange.end)) {
          return;
        }

        const dateStr = date.toISOString().split('T')[0];
        
        // Generate sample shifts for each day
        const dailyShifts = [
          {
            id: `${dateStr}-morning`,
            name: 'משמרת בוקר',
            start_time: '08:00',
            end_time: '16:00',
            branch_name: 'סניף ראשי',
            branch_id: 'main-branch',
            date: dateStr,
            max_employees: 3,
            current_employees: 1
          },
          {
            id: `${dateStr}-evening`,
            name: 'משמרת ערב',
            start_time: '16:00',
            end_time: '24:00',
            branch_name: 'סניף ראשי',
            branch_id: 'main-branch',
            date: dateStr,
            max_employees: 2,
            current_employees: 0
          }
        ];

        if (dayIndex < 5) { // Weekdays only
          dailyShifts.push({
            id: `${dateStr}-night`,
            name: 'משמרת לילה',
            start_time: '00:00',
            end_time: '08:00',
            branch_name: 'סניף ראשי',
            branch_id: 'main-branch',
            date: dateStr,
            max_employees: 1,
            current_employees: 0
          });
        }

        shifts.push(...dailyShifts);
      });

      return shifts;
    },
    enabled: !!businessId,
  });

  const navigateWeek = (direction: number) => {
    // Don't allow navigation if we have week range restrictions
    if (weekRange) return;
    
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + (direction * 7));
    setCurrentWeekStart(newStart);
  };

  // Helper function to check if two shifts overlap
  const shiftsOverlap = (shift1: AvailableShift, shift2: AvailableShift) => {
    if (shift1.date !== shift2.date) return false;
    
    const start1 = parseInt(shift1.start_time.replace(':', ''));
    const end1 = parseInt(shift1.end_time.replace(':', ''));
    const start2 = parseInt(shift2.start_time.replace(':', ''));
    const end2 = parseInt(shift2.end_time.replace(':', ''));
    
    return (start1 < end2 && start2 < end1);
  };

  const toggleShiftSelection = (shift: AvailableShift) => {
    const shiftDate = new Date(shift.date);
    const isSelected = selectedShifts.some(s => s.shiftId === shift.id);

    if (isSelected) {
      // Remove the shift and any overlapping shifts that were auto-selected
      setSelectedShifts(prev => prev.filter(s => s.shiftId !== shift.id));
    } else {
      if (shift.current_employees >= shift.max_employees) {
        toast({
          title: 'משמרת מלאה',
          description: 'המשמרת הזו כבר מלאה',
          variant: 'destructive',
        });
        return;
      }

      const newShift: SelectedShift = {
        date: shiftDate,
        shiftId: shift.id,
        shiftName: shift.name,
        startTime: shift.start_time,
        endTime: shift.end_time,
        branchName: shift.branch_name,
      };

      // Find overlapping shifts on the same date
      const overlappingShifts = availableShifts.filter(otherShift => 
        otherShift.id !== shift.id && 
        shiftsOverlap(shift, otherShift) &&
        otherShift.current_employees < otherShift.max_employees &&
        !selectedShifts.some(s => s.shiftId === otherShift.id)
      );

      // Add the main shift
      let shiftsToAdd = [newShift];

      // Add overlapping shifts automatically
      overlappingShifts.forEach(overlappingShift => {
        const overlappingShiftObj: SelectedShift = {
          date: new Date(overlappingShift.date),
          shiftId: overlappingShift.id,
          shiftName: overlappingShift.name,
          startTime: overlappingShift.start_time,
          endTime: overlappingShift.end_time,
          branchName: overlappingShift.branch_name,
        };
        shiftsToAdd.push(overlappingShiftObj);
      });

      setSelectedShifts(prev => [...prev, ...shiftsToAdd]);

      // Show toast if overlapping shifts were auto-selected
      if (overlappingShifts.length > 0) {
        toast({
          title: 'משמרות חופפות נבחרו אוטומטית',
          description: `נבחרו ${overlappingShifts.length} משמרות נוספות שחופפות בזמן`,
        });
      }
    }
  };

  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableShifts.filter(shift => shift.date === dateStr);
  };

  const getSpecialShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    let shifts = availableShifts.filter(shift => shift.date === dateStr);
    
    // Return only special shifts (opposite of employee preference)
    if (employeePreference === 'evening') {
      return shifts.filter(shift => shift.name.includes('בוקר'));
    } else {
      return shifts.filter(shift => shift.name.includes('ערב'));
    }
  };

  const isShiftSelectable = (shift: AvailableShift) => {
    if (employeePreference === 'evening') {
      return shift.name.includes('ערב') || shift.name.includes('לילה');
    } else {
      return shift.name.includes('בוקר');
    }
  };

  const toggleSpecialShiftSelection = (shift: AvailableShift) => {
    const shiftDate = new Date(shift.date);
    const isSelected = selectedSpecialShifts.some(s => s.shiftId === shift.id);

    if (isSelected) {
      setSelectedSpecialShifts(prev => prev.filter(s => s.shiftId !== shift.id));
    } else {
      if (shift.current_employees >= shift.max_employees) {
        toast({
          title: 'משמרת מלאה',
          description: 'המשמרת הזו כבר מלאה',
          variant: 'destructive',
        });
        return;
      }

      const newShift: SelectedShift = {
        date: shiftDate,
        shiftId: shift.id,
        shiftName: shift.name,
        startTime: shift.start_time,
        endTime: shift.end_time,
        branchName: shift.branch_name,
      };

      setSelectedSpecialShifts(prev => [...prev, newShift]);
    }
  };

  const isShiftSelected = (shiftId: string) => {
    return selectedShifts.some(s => s.shiftId === shiftId);
  };

  const handleSubmit = () => {
    const totalShifts = selectedShifts.length + selectedSpecialShifts.length;
    
    if (totalShifts === 0) {
      toast({
        title: 'לא נבחרו משמרות',
        description: 'אנא בחר לפחות משמרת אחת לפני השליחה',
        variant: 'destructive',
      });
      return;
    }

    // Combine regular and special shifts
    const allSelectedShifts = [...selectedShifts, ...selectedSpecialShifts];
    onSubmit(allSelectedShifts);
  };

  const formatWeekRange = () => {
    const startStr = currentWeekStart.toLocaleDateString('he-IL');
    const endDate = new Date(currentWeekStart);
    endDate.setDate(currentWeekStart.getDate() + 6);
    const endStr = endDate.toLocaleDateString('he-IL');
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              שבוע {formatWeekRange()}
            </CardTitle>
            <div className="flex items-center gap-2">
              {!weekRange && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek(-1)}
                  >
                    שבוע קודם
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek(1)}
                  >
                    שבוע הבא
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 justify-center">
            <Checkbox 
              id="special-shifts"
              checked={showSpecialShifts}
              onCheckedChange={(checked) => setShowSpecialShifts(checked as boolean)}
            />
            <label htmlFor="special-shifts" className="text-sm font-medium">
              הצג משמרות {employeePreference === 'evening' ? 'בוקר' : 'ערב'} מיוחדות
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const dayShifts = getShiftsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <Card key={date.toISOString()} className={isToday ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader className="pb-3">
                <div className="text-center">
                  <p className="font-medium text-gray-900">{dayNames[index]}</p>
                  <p className={`text-2xl font-bold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {date.getDate()}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="text-center text-sm text-gray-500 py-4">
                    טוען משמרות...
                  </div>
                ) : dayShifts.length === 0 ? (
                  <div className="text-center text-sm text-gray-400 py-4">
                    אין משמרות זמינות
                  </div>
                ) : (
                  <>
                    {/* Morning Shifts */}
                    {dayShifts.filter(s => s.name.includes('בוקר')).length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          משמרות בוקר
                        </div>
                         {dayShifts.filter(s => s.name.includes('בוקר')).map((shift) => {
                          const isSelected = isShiftSelected(shift.id);
                          const isFull = shift.current_employees >= shift.max_employees;
                          // Morning shift is special for evening workers
                          const isSpecialCase = employeePreference === 'evening' && showSpecialShifts;
                          
                          return (
                            <div
                              key={shift.id}
                             className={`p-3 rounded-lg border transition-all relative ${
                                isSelected
                                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                                  : isFull
                                  ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                                  : isShiftSelectable(shift)
                                  ? 'bg-white border-orange-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer'
                                  : 'bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                               }`}
                               onClick={() => !isFull && isShiftSelectable(shift) && toggleShiftSelection(shift)}
                            >
                              {isSpecialCase && (
                                <div className="absolute top-1 right-1">
                                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                                    מיוחד
                                  </Badge>
                                </div>
                              )}
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{shift.name}</div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Clock className="h-3 w-3" />
                                  <span>{shift.start_time} - {shift.end_time}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <MapPin className="h-3 w-3" />
                                  <span>{shift.branch_name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Users className="h-3 w-3" />
                                    <span>{shift.current_employees}/{shift.max_employees}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    {isSelected && (
                                      <Badge variant="secondary" className="text-xs">
                                        נבחר
                                      </Badge>
                                    )}
                                    {isFull && (
                                      <Badge variant="destructive" className="text-xs">
                                        מלא
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Evening Shifts */}
                    {dayShifts.filter(s => s.name.includes('ערב')).length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          משמרות ערב
                        </div>
                        {dayShifts.filter(s => s.name.includes('ערב')).map((shift) => {
                          const isSelected = isShiftSelected(shift.id);
                          const isFull = shift.current_employees >= shift.max_employees;
                          // Evening shift is special for morning workers
                          const isSpecialCase = employeePreference === 'morning' && showSpecialShifts;
                          
                          return (
                            <div
                              key={shift.id}
                              className={`p-3 rounded-lg border transition-all relative ${
                                isSelected
                                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                                  : isFull
                                  ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                                  : isShiftSelectable(shift)
                                  ? 'bg-white border-blue-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                                  : 'bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                              }`}
                              onClick={() => !isFull && isShiftSelectable(shift) && toggleShiftSelection(shift)}
                            >
                              {isSpecialCase && (
                                <div className="absolute top-1 right-1">
                                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                                    מיוחד
                                  </Badge>
                                </div>
                              )}
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{shift.name}</div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Clock className="h-3 w-3" />
                                  <span>{shift.start_time} - {shift.end_time}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <MapPin className="h-3 w-3" />
                                  <span>{shift.branch_name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Users className="h-3 w-3" />
                                    <span>{shift.current_employees}/{shift.max_employees}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    {isSelected && (
                                      <Badge variant="secondary" className="text-xs">
                                        נבחר
                                      </Badge>
                                    )}
                                    {isFull && (
                                      <Badge variant="destructive" className="text-xs">
                                        מלא
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Night Shifts */}
                    {dayShifts.filter(s => s.name.includes('לילה')).length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          משמרות לילה
                        </div>
                        {dayShifts.filter(s => s.name.includes('לילה')).map((shift) => {
                          const isSelected = isShiftSelected(shift.id);
                          const isFull = shift.current_employees >= shift.max_employees;
                          
                          return (
                            <div
                              key={shift.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-purple-100 border-purple-300 text-purple-800'
                                  : isFull
                                  ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-white border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                              }`}
                              onClick={() => !isFull && toggleShiftSelection(shift)}
                            >
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{shift.name}</div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Clock className="h-3 w-3" />
                                  <span>{shift.start_time} - {shift.end_time}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <MapPin className="h-3 w-3" />
                                  <span>{shift.branch_name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Users className="h-3 w-3" />
                                    <span>{shift.current_employees}/{shift.max_employees}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    {isSelected && (
                                      <Badge variant="secondary" className="text-xs">
                                        נבחר
                                      </Badge>
                                    )}
                                    {isFull && (
                                      <Badge variant="destructive" className="text-xs">
                                        מלא
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Shifts Summary */}
      {selectedShifts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              משמרות שנבחרו ({selectedShifts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedShifts.map((shift) => (
                <div
                  key={shift.shiftId}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm">{shift.shiftName}</div>
                    <div className="text-xs text-gray-600">
                      {shift.date.toLocaleDateString('he-IL')} | {shift.startTime} - {shift.endTime}
                    </div>
                    <div className="text-xs text-gray-600">{shift.branchName}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedShifts(prev => 
                      prev.filter(s => s.shiftId !== shift.shiftId)
                    )}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Special Shifts Section */}
      {showSpecialShifts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              הגשה מיוחדת - משמרות {employeePreference === 'evening' ? 'בוקר' : 'ערב'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weekDates.map((date, index) => {
                const specialShifts = getSpecialShiftsForDate(date);
                
                return (
                  <div key={date.toISOString()} className="space-y-2">
                    <div className="text-center text-sm font-medium text-gray-700">
                      {dayNames[index]} {date.getDate()}
                    </div>
                    {specialShifts.length === 0 ? (
                      <div className="text-center text-xs text-gray-400 py-2">
                        אין משמרות זמינות
                      </div>
                    ) : (
                      specialShifts.map((shift) => {
                        const isSelected = selectedSpecialShifts.some(s => s.shiftId === shift.id);
                        const isFull = shift.current_employees >= shift.max_employees;
                        const shiftColor = shift.name.includes('בוקר') ? 'orange' : 'blue';
                        
                        return (
                          <div
                            key={shift.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? `bg-${shiftColor}-100 border-${shiftColor}-300 text-${shiftColor}-800`
                                : isFull
                                ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                                : `bg-white border-${shiftColor}-200 hover:border-${shiftColor}-300 hover:bg-${shiftColor}-50`
                            }`}
                            onClick={() => !isFull && toggleSpecialShiftSelection(shift)}
                          >
                            <div className="space-y-1">
                              <div className="font-medium text-xs">{shift.name}</div>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Clock className="h-3 w-3" />
                                <span>{shift.start_time} - {shift.end_time}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Users className="h-3 w-3" />
                                  <span>{shift.current_employees}/{shift.max_employees}</span>
                                </div>
                                {isSelected && (
                                  <Badge variant="secondary" className="text-xs">
                                    נבחר
                                  </Badge>
                                )}
                                {isFull && (
                                  <Badge variant="destructive" className="text-xs">
                                    מלא
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Special Shifts Summary */}
      {selectedSpecialShifts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              משמרות מיוחדות שנבחרו ({selectedSpecialShifts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedSpecialShifts.map((shift) => (
                <div
                  key={shift.shiftId}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div>
                    <div className="font-medium text-sm">{shift.shiftName}</div>
                    <div className="text-xs text-gray-600">
                      {shift.date.toLocaleDateString('he-IL')} | {shift.startTime} - {shift.endTime}
                    </div>
                    <div className="text-xs text-gray-600">{shift.branchName}</div>
                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 mt-1">
                      הגשה מיוחדת
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSpecialShifts(prev => 
                      prev.filter(s => s.shiftId !== shift.shiftId)
                    )}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        <Button
          onClick={handleSubmit}
          disabled={(selectedShifts.length === 0 && selectedSpecialShifts.length === 0) || submitting}
          className="flex-1"
          size="lg"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              שולח...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              שלח משמרות ({selectedShifts.length + selectedSpecialShifts.length})
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={onVacationRequest}
          disabled={submitting}
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          בקשת חופשה
        </Button>
      </div>
    </div>
  );
};
