
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ShiftNotesInputProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export const ShiftNotesInput: React.FC<ShiftNotesInputProps> = ({
  notes,
  onNotesChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes" className="text-sm text-gray-600">הערות</Label>
      <Input
        id="notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="הערות נוספות למשמרת"
        className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
};
