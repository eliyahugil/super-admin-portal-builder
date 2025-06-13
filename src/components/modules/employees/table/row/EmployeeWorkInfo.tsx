
import React from 'react';
import { Calendar } from 'lucide-react';

interface EmployeeWorkInfoProps {
  hireDate?: string | null;
  weeklyHoursRequired?: number | null;
}

export const EmployeeWorkInfo: React.FC<EmployeeWorkInfoProps> = ({
  hireDate,
  weeklyHoursRequired
}) => {
  return (
    <div className="space-y-1">
      {hireDate && (
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(hireDate).toLocaleDateString('he-IL')}
        </div>
      )}
      {weeklyHoursRequired && (
        <div className="text-xs text-gray-500">
          {weeklyHoursRequired} שעות/שבוע
        </div>
      )}
    </div>
  );
};
