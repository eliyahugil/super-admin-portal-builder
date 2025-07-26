
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

  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  // Helper function to convert time string to minutes
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if a shift is completely contained within another shift
  const isShiftContained = (containerShift: CompatibleShift, containedShift: CompatibleShift): boolean => {
    // Must be same day and same branch
    if (containerShift.day_of_week !== containedShift.day_of_week || 
        containerShift.branch_id !== containedShift.branch_id) {
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
    if (shift1.day_of_week !== shift2.day_of_week) return false;
    
    const start1 = timeToMinutes(shift1.start_time);
    const end1 = timeToMinutes(shift1.end_time);
    const start2 = timeToMinutes(shift2.start_time);
    const end2 = timeToMinutes(shift2.end_time);
    
    return start1 < end2 && start2 < end1;
  };

  // Check if a shift should be auto-selected based on selected shifts
  const shouldAutoSelect = (shift: CompatibleShift): boolean => {
    return selectedShifts.some(selectedShift => {
      return isShiftContained(selectedShift, shift);
    });
  };

  // Check if a shift conflicts with selected shifts
  const hasConflict = (shift: CompatibleShift): boolean => {
    return selectedShifts.some(selectedShift => {
      // Skip if it's the same shift
      if (selectedShift.id === shift.id) return false;
      
      // Check for overlap but not if one contains the other
      const hasOverlap = hasTimeOverlap(selectedShift, shift);
      const isContained = isShiftContained(selectedShift, shift) || isShiftContained(shift, selectedShift);
      
      return hasOverlap && !isContained;
    });
  };

  // Auto-select shifts when selected shifts change
  useEffect(() => {
    console.log('🔄 Auto-selecting shifts based on selected shifts:', selectedShifts);
    
    Object.values(shiftsByDay).forEach(dayData => {
      dayData.compatibleShifts.forEach(shift => {
        const isAlreadySelected = selectedShifts.find(s => s.id === shift.id);
        const shouldBeAutoSelected = shouldAutoSelect(shift);
        
        // Auto-select if should be selected but isn't
        if (shouldBeAutoSelected && !isAlreadySelected) {
          console.log('✅ Auto-selecting shift:', shift.shift_name, shift.start_time, '-', shift.end_time);
          onShiftToggle(shift);
        }
      });
    });
  }, [selectedShifts, shiftsByDay, onShiftToggle]);

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
    return shouldAutoSelect(shift);
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
            ? 'border-blue-500 bg-blue-50'
            : hasShiftConflict
            ? 'border-red-300 bg-red-50 opacity-60 cursor-not-allowed'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => handleShiftClick(shift)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-500" />
            <div>
              <div className="font-medium text-lg">
                {shift.start_time} - {shift.end_time}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {shift.branch.name}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isSelected && (
              <Badge variant="default" className="bg-blue-500 text-white">
                נבחר
              </Badge>
            )}
            {isAutoSelected && !isSelected && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Star className="h-3 w-3 mr-1" />
                זמין אוטומטית
              </Badge>
            )}
            {hasShiftConflict && (
              <Badge variant="destructive" className="bg-red-100 text-red-800">
                התנגשות
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
        
        <div className="mt-2 text-sm font-medium text-gray-700">
          {shift.shift_name}
        </div>
        
        {isAutoSelected && !isSelected && (
          <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
            זמין - כבר נבחרה משמרת המכילה את השעות הללו
          </div>
        )}
        
        {hasShiftConflict && (
          <div className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded">
            לא ניתן לבחור - מתנגש עם משמרת אחרת שנבחרה
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
    const autoSelectedCount = regularShifts.filter(s => shouldAutoSelect(s) && !isShiftSelected(s)).length;

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-blue-800">{dayName}</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedCount > 0 && (
              <Badge variant="default" className="bg-blue-500 text-white">
                {selectedCount} נבחרו
              </Badge>
            )}
            {autoSelectedCount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {autoSelectedCount} זמינות אוטומטית
              </Badge>
            )}
            {regularShifts.length > 0 && (
              <Badge variant="outline" className="border-blue-300">
                {regularShifts.length} משמרות זמינות
              </Badge>
            )}
            {specialShifts.length > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                {specialShifts.length} משמרות מיוחדות
              </Badge>
            )}
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

        const regularShifts = dayData.compatibleShifts || [];
        const specialShifts = dayData.specialShifts || [];

        return (
          <div key={dayName} className="space-y-4">
            <DayHeader dayName={dayName} dayIndex={index} />
            
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-6">
                {/* Regular Shifts */}
                {regularShifts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-800">משמרות רגילות</h3>
                    </div>
                    <div className="grid gap-3">
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
                          className="w-full flex items-center justify-between p-4 h-auto border-yellow-300 hover:bg-yellow-50"
                        >
                          <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-yellow-600" />
                            <span className="font-medium text-lg">
                              משמרות מיוחדות ({specialShifts.length})
                            </span>
                          </div>
                          {showSpecialShifts[dayName] ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="mt-4 grid gap-3">
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
