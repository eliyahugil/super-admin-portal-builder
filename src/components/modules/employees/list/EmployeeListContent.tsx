
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeeListTable } from './EmployeeListTable';
import type { Employee } from '@/types/employee';

interface EmployeeListContentProps {
  employees: Employee[];
  searchTerm: string;
  selectedEmployees: Set<string>;
  onSelectEmployee: (employeeId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteEmployee: (employee: Employee) => void;
  onRefetch: () => void;
  loading: boolean;
  totalEmployees: number;
}

export const EmployeeListContent: React.FC<EmployeeListContentProps> = ({
  employees,
  searchTerm,
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  onDeleteEmployee,
  onRefetch,
  loading,
  totalEmployees,
}) => {
  return (
    <div className="space-y-4" dir="rtl">
      {/* Results Summary */}
      {searchTerm && (
        <div className="text-sm text-gray-600 text-right">
          נמצאו {employees.length} תוצאות מתוך {totalEmployees} עובדים
        </div>
      )}

      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center" dir="rtl">
            <div className="text-gray-500">
              {searchTerm ? 'לא נמצאו עובדים התואמים לחיפוש' : 'אין עובדים רשומים'}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <EmployeeListTable
              employees={employees}
              selectedEmployees={selectedEmployees}
              onSelectEmployee={onSelectEmployee}
              onSelectAll={onSelectAll}
              onDeleteEmployee={onDeleteEmployee}
              onRefetch={onRefetch}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
