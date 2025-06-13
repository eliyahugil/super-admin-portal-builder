
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmployeeNavigationButtonsProps {
  previousEmployee: { id: string; first_name: string; last_name: string } | null;
  nextEmployee: { id: string; first_name: string; last_name: string } | null;
  currentIndex: number;
  total: number;
}

export const EmployeeNavigationButtons: React.FC<EmployeeNavigationButtonsProps> = ({
  previousEmployee,
  nextEmployee,
  currentIndex,
  total
}) => {
  const navigate = useNavigate();

  const handleNavigate = (employeeId: string) => {
    navigate(`/modules/employees/profile/${employeeId}`);
  };

  if (total <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">
        {currentIndex + 1} מתוך {total}
      </span>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => previousEmployee && handleNavigate(previousEmployee.id)}
          disabled={!previousEmployee}
          className="p-2"
          title={previousEmployee ? `${previousEmployee.first_name} ${previousEmployee.last_name}` : ''}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => nextEmployee && handleNavigate(nextEmployee.id)}
          disabled={!nextEmployee}
          className="p-2"
          title={nextEmployee ? `${nextEmployee.first_name} ${nextEmployee.last_name}` : ''}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
