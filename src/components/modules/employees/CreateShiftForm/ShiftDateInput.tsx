
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ShiftDateInputProps {
  shiftDate: string;
  onDateChange: (value: string) => void;
}

export const ShiftDateInput: React.FC<ShiftDateInputProps> = ({
  shiftDate,
  onDateChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="date" className="text-sm text-gray-600">תאריך *</Label>
      <Input
        id="date"
        type="date"
        value={shiftDate}
        onChange={(e) => onDateChange(e.target.value)}
        required
        className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
};
