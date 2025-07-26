
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Clock, MapPin, Star, Zap, Calendar } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DayShifts, CompatibleShift } from '@/hooks/useEmployeeCompatibleShifts';

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
  const [showSpecialShifts, setShowSpecialShifts] = useState<Record<string, boolean>>({});
  const [autoSelectedShifts, setAutoSelectedShifts] = useState<Set<string>>(new Set());

  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  // Helper function to convert time string to minutes
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Sort shifts by start time
  const sortShiftsByTime = (shifts: CompatibleShift[]): CompatibleShift[] => {
    return [...shifts].sort((a, b) => {
      const timeA = timeToMinutes(a.start_time);
      const timeB = timeToMinutes(b.start_time);
      return timeA - timeB;
    });
  };

  // Check if a shift is completely contained within another shift
  const isShiftContainedWithin = (containerShift: CompatibleShift, containedShift: CompatibleShift): boolean => {
    // Must be same day and same branch
    if (containerShift.day_of_week !== containedShift.day_of_week || 
        containerShift.branch_id !== containedShift.branch_id) {
      return false;
    }

    // Can't be the same shift
    if (containerShift.id === containedShift.id) {
      return false;
    }

    const containerStart = timeToMinutes(containerShift.start_time);
    const containerEnd = timeToMinutes(containerShift.end_time);
    const containedStart = timeToMinutes(containedShift.start_time);
    const containedEnd = timeToMinutes(containedShift.end_time);

    // The contained shift must be fully within the container shift
    return containerStart <= containedStart && containerEnd >= containedEnd;
  };

  // Check if shifts overlap (for conflict detection)
  const hasTimeOverlap = (shift1: CompatibleShift, shift2: CompatibleShift): boolean => {
    if (shift1.day_of_week !== shift2.day_of_week || shift1.id === shift2.id) return false;
    
    const start1 = timeToMinutes(shift1.start_time);
    const end1 = timeToMinutes(shift1.end_time);
    const start2 = timeToMinutes(shift2.start_time);
    const end2 = timeToMinutes(shift2.end_time);
    
    return start1 < end2 && start2 < end1;
  };

  // Find all shifts that should be auto-selected based on current selection
  const findAutoSelectableShifts = (currentlySelected: CompatibleShift[]): CompatibleShift[] => {
    const autoSelectable: CompatibleShift[] = [];
    
    // For each selected shift, find all shifts that are contained within it
    currentlySelected.forEach(selectedShift => {
      Object.values(shiftsByDay).forEach(dayData => {
        dayData.compatibleShifts.forEach(shift => {
          if (isShiftContainedWithin(selectedShift, shift)) {
            // Make sure this shift isn't already selected and doesn't conflict
            const isAlreadySelected = currentlySelected.some(s => s.id === shift.id);
            const hasConflict = currentlySelected.some(s => 
              s.id !== shift.id && hasTimeOverlap(s, shift) && !isShiftContainedWithin(s, shift) && !isShiftContainedWithin(shift, s)
            );
            
            if (!isAlreadySelected && !hasConflict) {
              autoSelectable.push(shift);
            }
          }
        });
      });
    });
    
    return autoSelectable;
  };

  // Auto-select shifts when selected shifts change
  useEffect(() => {
    const autoSelectable = findAutoSelectableShifts(selectedShifts);
    const newAutoSelected = new Set(autoSelectable.map(s => s.id));
    
    // Only auto-select shifts that weren't previously auto-selected
    autoSelectable.forEach(shift => {
      if (!autoSelectedShifts.has(shift.id)) {
        console.log('🎯 Auto-selecting shift:', shift.shift_name, shift.start_time, '-', shift.end_time);
        onShiftToggle(shift);
      }
    });
    
    setAutoSelectedShifts(newAutoSelected);
  }, [selectedShifts, shiftsByDay]);

  // Check if a shift conflicts with selected shifts
  const hasConflict = (shift: CompatibleShift): boolean => {
    return selectedShifts.some(selectedShift => {
      if (selectedShift.id === shift.id) return false;
      
      const hasOverlap = hasTimeOverlap(selectedShift, shift);
      const isContained = isShiftContainedWithin(selectedShift, shift) || isShiftContainedWithin(shift, selectedShift);
      
      return hasOverlap && !isContained;
    });
  };

  const toggleSpecialShifts = (dayName: string) => {
    setShowSpecialShifts(prev => ({
      ...prev,
      [dayName]: !prev[dayName]
    }));
  };

  const isShiftSelected = (shift: CompatibleShift) => {
    return selectedShifts.some(s => s.id === shift.id);
  };

  const isShiftAutoSelected = (shift: CompatibleShift) => {
    return autoSelectedShifts.has(shift.id);
  };

  const handleShiftClick = (shift: CompatibleShift) => {
    console.log('🖱️ Shift clicked:', shift.shift_name, shift.start_time, '-', shift.end_time);
    
    // Don't allow selection if there's a conflict
    if (hasConflict(shift) && !isShiftSelected(shift)) {
      console.log('❌ Blocked due to conflict');
      return;
    }
    
    onShiftToggle(shift);
  };

  const ShiftCard = ({ shift }: { shift: CompatibleShift }) => {
    const isSelected = isShiftSelected(shift);
    const isAutoSelected = isShiftAutoSelected(shift);
    const hasShiftConflict = hasConflict(shift);
    const isSpecial = shift.shift_type === 'special' || shift.shift_type === 'emergency';
    
    return (
      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : isAutoSelected
            ? 'border-green-400 bg-green-50 shadow-sm'
            : hasShiftConflict
            ? 'border-red-300 bg-red-50 opacity-60 cursor-not-allowed'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={() => handleShiftClick(shift)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-xl text-gray-800">
                {shift.start_time} - {shift.end_time}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {shift.branch.name}
              </div>
              <div className="text-sm font-medium text-gray-700 mt-1">
                {shift.shift_name}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {isSelected && (
              <Badge variant="default" className="bg-blue-500 text-white">
                ✓ נבחר
              </Badge>
            )}
            {isAutoSelected && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Star className="h-3 w-3 mr-1" />
                נבחר אוטומטית
              </Badge>
            )}
            {hasShiftConflict && (
              <Badge variant="destructive" className="bg-red-100 text-red-800">
                ❌ התנגשות
              </Badge>
            )}
            {isSpecial && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                <Zap className="h-3 w-3 mr-1" />
                מיוחד
              </Badge>
            )}
          </div>
        </div>
        
        {isAutoSelected && (
          <div className="mt-3 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
            <Star className="h-3 w-3 inline mr-1" />
            נבחר אוטומטית - נמצא בטווח השעות של משמרת שנבחרה
          </div>
        )}
        
        {hasShiftConflict && (
          <div className="mt-3 text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">
            ❌ לא ניתן לבחור - מתנגש עם משמרת אחרת שנבחרה
          </div>
        )}
      </div>
    );
  };

  const DayHeader = ({ dayName, dayIndex }: { dayName: string; dayIndex: number }) => {
    const dayData = shiftsByDay[dayName];
    if (!dayData || (dayData.compatibleShifts.length === 0 && dayData.specialShifts.length === 0)) {
      return null;
    }

    const regularShifts = dayData.compatibleShifts || [];
    const specialShifts = dayData.specialShifts || [];
    const selectedCount = selectedShifts.filter(s => s.day_of_week === dayIndex).length;
    const autoSelectedCount = regularShifts.filter(s => isShiftAutoSelected(s)).length;

    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{dayName}</h2>
              <p className="text-blue-100 text-sm">יום {dayIndex + 1} בשבוע</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedCount > 0 && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {selectedCount} נבחרו
              </Badge>
            )}
            {autoSelectedCount > 0 && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-100 border-green-300/30">
                {autoSelectedCount} אוטומטיות
              </Badge>
            )}
            <Badge variant="outline" className="bg-white/10 text-white border-white/30">
              {regularShifts.length + specialShifts.length} זמינות
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8" dir="rtl">
      {daysOfWeek.map((dayName, index) => {
        const dayData = shiftsByDay[dayName];
        
        if (!dayData || (dayData.compatibleShifts.length === 0 && dayData.specialShifts.length === 0)) {
          return null;
        }

        const regularShifts = sortShiftsByTime(dayData.compatibleShifts || []);
        const specialShifts = sortShiftsByTime(dayData.specialShifts || []);

        return (
          <div key={dayName} className="space-y-4">
            <DayHeader dayName={dayName} dayIndex={index} />
            
            <Card className="overflow-hidden shadow-lg border-2 border-blue-100">
              <CardContent className="p-6">
                {/* Regular Shifts */}
                {regularShifts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">משמרות רגילות</h3>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {regularShifts.length} זמינות
                      </Badge>
                    </div>
                    <div className="grid gap-4">
                      {regularShifts.map((shift) => (
                        <ShiftCard key={shift.id} shift={shift} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Shifts Section */}
                {specialShifts.length > 0 && (
                  <div className="mt-8">
                    <Separator className="mb-6" />
                    <Collapsible 
                      open={showSpecialShifts[dayName]} 
                      onOpenChange={() => toggleSpecialShifts(dayName)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-between p-6 h-auto border-2 border-yellow-300 hover:bg-yellow-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                              <Zap className="h-5 w-5 text-yellow-600" />
                            </div>
                            <span className="font-bold text-lg">
                              משמרות מיוחדות
                            </span>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              {specialShifts.length} זמינות
                            </Badge>
                          </div>
                          {showSpecialShifts[dayName] ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="mt-4 grid gap-4">
                          {specialShifts.map((shift) => (
                            <ShiftCard key={shift.id} shift={shift} />
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};
