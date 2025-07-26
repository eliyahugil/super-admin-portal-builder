
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Timer, Star, Sparkles } from 'lucide-react';
import { CompatibleShift, DayShifts } from '@/hooks/useEmployeeCompatibleShifts';
import { ShiftCard } from './ShiftCard';

interface DaySectionProps {
  dayName: string;
  dayData: DayShifts;
  onShiftToggle: (shift: CompatibleShift) => void;
  selectedShifts: CompatibleShift[];
}

export const DaySection: React.FC<DaySectionProps> = ({
  dayName,
  dayData,
  onShiftToggle,
  selectedShifts
}) => {
  const isShiftSelected = (shift: CompatibleShift) => {
    return selectedShifts.some(s => s.id === shift.id);
  };

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
    <Card className="shadow-sm border-l-4 border-l-blue-500">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-blue-800">{dayName}</span>
            {autoSelectedShifts.length > 0 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <Sparkles className="h-3 w-3 mr-1" />
                {autoSelectedShifts.length} מומלצות
              </Badge>
            )}
            {specialShifts.length > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                <Star className="h-3 w-3 mr-1" />
                {specialShifts.length} מיוחדות
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-600">
            יום {dayData.dayIndex + 1}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {!hasShifts ? (
          <div className="text-center py-8 text-gray-500">
            <Timer className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>אין משמרות זמינות ביום זה</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Auto-selected shifts section */}
            {sortedAutoSelected.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800 text-lg">משמרות מומלצות</h4>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    נבחרו אוטומטית
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {sortedAutoSelected.map(shift => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      isSelected={isShiftSelected(shift)}
                      isAutoSelected={true}
                      onToggle={onShiftToggle}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Regular compatible shifts section */}
            {sortedRegular.length > 0 && (
              <div>
                {sortedAutoSelected.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <Separator className="flex-1" />
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">משמרות נוספות</span>
                    </div>
                    <Separator className="flex-1" />
                  </div>
                )}
                <div className="grid gap-3">
                  {sortedRegular.map(shift => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      isSelected={isShiftSelected(shift)}
                      isAutoSelected={false}
                      onToggle={onShiftToggle}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Special shifts section */}
            {sortedSpecial.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-800 text-lg">משמרות מיוחדות</h4>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                    דרושה אישור מיוחד
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {sortedSpecial.map(shift => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      isSelected={isShiftSelected(shift)}
                      isAutoSelected={false}
                      onToggle={onShiftToggle}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
