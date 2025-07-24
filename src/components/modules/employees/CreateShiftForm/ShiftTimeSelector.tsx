import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';

interface ShiftTimeSelectorProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  disabled?: boolean;
}

export const ShiftTimeSelector: React.FC<ShiftTimeSelectorProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  disabled = false
}) => {
  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Clock className="h-4 w-4" />
        שעות המשמרת
      </Label>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-time" className="text-xs text-gray-600">
            שעת התחלה
          </Label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            disabled={disabled}
            className="w-full"
            dir="ltr"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end-time" className="text-xs text-gray-600">
            שעת סיום
          </Label>
          <Input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            disabled={disabled}
            className="w-full"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
};