
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { EmployeesTableGrid } from './EmployeesTableGrid';
import type { Employee } from '@/types/employee';

interface EmployeesTableContentProps {
  filteredEmployees: Employee[];
  search: string;
  filterType: string;
  filterStatus: string;
  onCreateEmployee: () => void;
  onTokenSent: () => void;
}

export const EmployeesTableContent: React.FC<EmployeesTableContentProps> = ({
  filteredEmployees,
  search,
  filterType,
  filterStatus,
  onCreateEmployee,
  onTokenSent,
}) => {
  if (filteredEmployees.length === 0) {
    return (
      <CardContent>
        <div className="text-center text-gray-500 py-8">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p>{search || filterType !== 'all' || filterStatus !== 'all' ? 'לא נמצאו עובדים התואמים לחיפוש' : 'אין עובדים רשומים במערכת'}</p>
          {(!search && filterType === 'all' && filterStatus === 'all') && (
            <Button onClick={onCreateEmployee} className="mt-4">
              הוסף עובד ראשון
            </Button>
          )}
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent>
      <div className="overflow-x-auto">
        <EmployeesTableGrid employees={filteredEmployees} onTokenSent={onTokenSent} />
      </div>
    </CardContent>
  );
};
