
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { EmployeeEditButton } from '../edit/EmployeeEditButton';
import { EmployeeNavigationButtons } from './EmployeeNavigationButtons';
import { useEmployeeNavigation } from './useEmployeeNavigation';
import type { Employee } from '@/types/employee';

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
  const { previousEmployee, nextEmployee, currentIndex, total } = useEmployeeNavigation(employee.id);

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5 cursor-pointer" onClick={onGoBack} />
            פרופיל עובד
          </CardTitle>
          <EmployeeNavigationButtons
            previousEmployee={previousEmployee}
            nextEmployee={nextEmployee}
            currentIndex={currentIndex}
            total={total}
          />
        </div>
        <EmployeeEditButton employee={employee} onSuccess={onEmployeeUpdated} />
      </div>
    </CardHeader>
  );
};
