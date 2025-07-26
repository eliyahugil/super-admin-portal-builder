
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, CheckCircle2, Circle, Star, Sparkles, Timer } from 'lucide-react';
import { CompatibleShift, DayShifts } from '@/hooks/useEmployeeCompatibleShifts';

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
  const isShiftSelected = (shift: CompatibleShift) => {
    return selectedShifts.some(s => s.id === shift.id);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove seconds
  };

  const getShiftDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const renderShift = (shift: CompatibleShift, isAutoSelected: boolean = false) => {
    const selected = isShiftSelected(shift);
    const duration = getShiftDuration(shift.start_time, shift.end_time);
    
    return (
      <div
        key={shift.id}
        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
          selected
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : isAutoSelected
            ? 'border-green-500 bg-green-50 shadow-sm'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
        onClick={() => onShiftToggle(shift)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {selected ? (
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <h4 className="font-medium text-gray-900">{shift.shift_name}</h4>
              {isAutoSelected && (
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                    מומלץ
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                <span className="text-gray-500">({duration})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{shift.branch.name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {shift.shift_type}
              </Badge>
              {shift.reason && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800 border-yellow-300">
                  {shift.reason}
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            variant={selected ? "default" : "outline"}
            size="sm"
            className={`ml-2 ${selected ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onShiftToggle(shift);
            }}
          >
            {selected ? 'נבחר' : 'בחר'}
          </Button>
        </div>
      </div>
    );
  };

  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  
  return (
    <div className="space-y-6">
      {daysOfWeek.map((dayName) => {
        const dayData = shiftsByDay[dayName];
        if (!dayData) return null;

        const { compatibleShifts, autoSelectedShifts, specialShifts } = dayData;
        const hasShifts = compatibleShifts.length > 0 || specialShifts.length > 0;

        // Sort shifts by start time for better display
        const sortedAutoSelected = [...autoSelectedShifts].sort((a, b) => {
          const timeA = new Date(`2000-01-01T${a.start_time}`).getTime();
          const timeB = new Date(`2000-01-01T${b.start_time}`).getTime();
          return timeA - timeB;
        });

        const sortedRegular = compatibleShifts
          .filter(shift => !autoSelectedShifts.some(auto => auto.id === shift.id))
          .sort((a, b) => {
            const timeA = new Date(`2000-01-01T${a.start_time}`).getTime();
            const timeB = new Date(`2000-01-01T${b.start_time}`).getTime();
            return timeA - timeB;
          });

        const sortedSpecial = [...specialShifts].sort((a, b) => {
          const timeA = new Date(`2000-01-01T${a.start_time}`).getTime();
          const timeB = new Date(`2000-01-01T${b.start_time}`).getTime();
          return timeA - timeB;
        });

        return (
          <Card key={dayName} className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-800">{dayName}</span>
                  <Badge variant="outline" className="text-sm">
                    {compatibleShifts.length} משמרות זמינות
                  </Badge>
                  {autoSelectedShifts.length > 0 && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {autoSelectedShifts.length} מומלצות
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  יום {dayData.dayIndex + 1}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {!hasShifts ? (
                <div className="text-center py-8 text-gray-500">
                  <Timer className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>אין משמרות זמינות ביום זה</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Auto-selected shifts section */}
                  {sortedAutoSelected.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-green-800">משמרות מומלצות</h4>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                          נבחרו אוטומטית
                        </Badge>
                      </div>
                      <div className="grid gap-3">
                        {sortedAutoSelected.map(shift => renderShift(shift, true))}
                      </div>
                    </div>
                  )}
                  
                  {/* Regular compatible shifts section */}
                  {sortedRegular.length > 0 && (
                    <div>
                      {sortedAutoSelected.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <h4 className="font-medium text-gray-800">משמרות נוספות</h4>
                          </div>
                        </>
                      )}
                      <div className="grid gap-3">
                        {sortedRegular.map(shift => renderShift(shift, false))}
                      </div>
                    </div>
                  )}
                  
                  {/* Special shifts section */}
                  {sortedSpecial.length > 0 && (
                    <div>
                      <Separator className="my-4" />
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-4 w-4 text-yellow-600" />
                        <h4 className="font-medium text-yellow-800">משמרות מיוחדות</h4>
                      </div>
                      <div className="grid gap-3">
                        {sortedSpecial.map(shift => renderShift(shift, false))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
