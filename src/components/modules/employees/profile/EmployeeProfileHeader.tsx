
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
    <CardHeader className="p-3 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer" onClick={onGoBack} />
            פרופיל עובד
          </CardTitle>
          <div className="hidden sm:block">
            <EmployeeNavigationButtons
              previousEmployee={previousEmployee}
              nextEmployee={nextEmployee}
              currentIndex={currentIndex}
              total={total}
            />
          </div>
        </div>
        <EmployeeEditButton employee={employee} onSuccess={onEmployeeUpdated} />
      </div>
      {/* Mobile navigation */}
      <div className="block sm:hidden mt-3">
        <EmployeeNavigationButtons
          previousEmployee={previousEmployee}
          nextEmployee={nextEmployee}
          currentIndex={currentIndex}
          total={total}
        />
      </div>
    </CardHeader>
  );
};
