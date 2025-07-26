
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { CompatibleShift } from '@/hooks/useEmployeeCompatibleShifts';

interface ShiftCardProps {
  shift: CompatibleShift;
  isSelected: boolean;
  isAutoSelected?: boolean;
  onToggle: (shift: CompatibleShift) => void;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  isSelected,
  isAutoSelected = false,
  onToggle
}) => {
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getShiftDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const duration = getShiftDuration(shift.start_time, shift.end_time);

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : isAutoSelected
          ? 'border-green-500 bg-green-50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={() => onToggle(shift)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isSelected ? (
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
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className={`ml-2 ${isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(shift);
          }}
        >
          {isSelected ? 'נבחר' : 'בחר'}
        </Button>
      </div>
    </div>
  );
};
