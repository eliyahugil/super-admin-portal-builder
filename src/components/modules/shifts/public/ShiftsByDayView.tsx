
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Clock, MapPin, Star, Zap } from 'lucide-react';
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

  const toggleSpecialShifts = (dayName: string) => {
    setShowSpecialShifts(prev => ({
      ...prev,
      [dayName]: !prev[dayName]
    }));
  };

  const isShiftSelected = (shift: CompatibleShift) => {
    return selectedShifts.some(s => s.id === shift.id);
  };

  const ShiftCard = ({ shift }: { shift: CompatibleShift }) => {
    const isSelected = isShiftSelected(shift);
    const isSpecial = shift.shift_type === 'special' || shift.shift_type === 'emergency';
    
    return (
      <div
        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => onShiftToggle(shift)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-medium">
              {shift.start_time} - {shift.end_time}
            </span>
            {shift.autoSelected && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Star className="h-3 w-3 mr-1" />
                מומלץ
              </Badge>
            )}
            {isSpecial && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                <Zap className="h-3 w-3 mr-1" />
                מיוחד
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{shift.shift_name}</div>
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {shift.branch.name}
            </div>
          </div>
        </div>
        {shift.reason && (
          <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
            {shift.reason}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {daysOfWeek.map((dayName, index) => {
        const dayData = shiftsByDay[dayName];
        
        if (!dayData || (dayData.compatibleShifts.length === 0 && dayData.specialShifts.length === 0)) {
          return null;
        }

        const regularShifts = dayData.compatibleShifts || [];
        const specialShifts = dayData.specialShifts || [];
        const autoSelectedCount = dayData.autoSelectedShifts?.length || 0;

        return (
          <Card key={dayName} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-right">
                  {dayName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {autoSelectedCount > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {autoSelectedCount} מומלצות
                    </Badge>
                  )}
                  {regularShifts.length > 0 && (
                    <Badge variant="outline">
                      {regularShifts.length} משמרות זמינות
                    </Badge>
                  )}
                  {specialShifts.length > 0 && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                      {specialShifts.length} משמרות מיוחדות
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Regular Shifts */}
              {regularShifts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    משמרות רגילות
                  </h4>
                  <div className="space-y-2">
                    {regularShifts.map((shift) => (
                      <ShiftCard key={shift.id} shift={shift} />
                    ))}
                  </div>
                </div>
              )}

              {/* Special Shifts Section */}
              {specialShifts.length > 0 && (
                <div className="mt-6">
                  <Separator className="mb-4" />
                  <Collapsible 
                    open={showSpecialShifts[dayName]} 
                    onOpenChange={() => toggleSpecialShifts(dayName)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-between p-3 h-auto"
                      >
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">
                            משמרות מיוחדות ({specialShifts.length})
                          </span>
                        </div>
                        {showSpecialShifts[dayName] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="mt-3 space-y-2">
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
        );
      })}
    </div>
  );
};
