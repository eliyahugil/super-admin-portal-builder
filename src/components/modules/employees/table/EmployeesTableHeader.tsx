
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { User, Plus } from 'lucide-react';

interface EmployeesTableHeaderProps {
  employeesCount: number;
  onCreateEmployee: () => void;
}

export const EmployeesTableHeader: React.FC<EmployeesTableHeaderProps> = ({
  employeesCount,
  onCreateEmployee,
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          ניהול עובדים ({employeesCount})
        </CardTitle>
        <Button onClick={onCreateEmployee} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          הוסף עובד חדש
        </Button>
      </div>
    </CardHeader>
  );
};
