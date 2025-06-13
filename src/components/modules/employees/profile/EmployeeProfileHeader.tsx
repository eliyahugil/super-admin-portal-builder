
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { EmployeeEditButton } from '../edit/EmployeeEditButton';
import type { Employee } from '@/types/supabase';

interface EmployeeProfileHeaderProps {
  employee: Employee;
  onGoBack: () => void;
  onEmployeeUpdated: () => void;
}

export const EmployeeProfileHeader: React.FC<EmployeeProfileHeaderProps> = ({
  employee,
  onGoBack,
  onEmployeeUpdated,
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ArrowLeft className="h-5 w-5 cursor-pointer" onClick={onGoBack} />
          פרופיל עובד
        </CardTitle>
        <EmployeeEditButton employee={employee} onSuccess={onEmployeeUpdated} />
      </div>
    </CardHeader>
  );
};
