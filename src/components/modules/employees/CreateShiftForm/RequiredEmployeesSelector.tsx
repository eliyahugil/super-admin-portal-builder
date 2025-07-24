import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';

interface RequiredEmployeesSelectorProps {
  requiredEmployees: number;
  onRequiredEmployeesChange: (count: number) => void;
  disabled?: boolean;
}

export const RequiredEmployeesSelector: React.FC<RequiredEmployeesSelectorProps> = ({
  requiredEmployees,
  onRequiredEmployeesChange,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= 50) { // הגבלה סבירה
      onRequiredEmployeesChange(value);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Users className="h-4 w-4" />
        מספר עובדים נדרש במשמרת
      </Label>
      
      <div className="space-y-2">
        <Input
          type="number"
          value={requiredEmployees}
          onChange={handleChange}
          disabled={disabled}
          min={1}
          max={50}
          className="w-32"
          dir="ltr"
        />
        <p className="text-xs text-gray-500">
          מספר העובדים שנדרשים למלא את המשמרת (1-50)
        </p>
      </div>
    </div>
  );
};