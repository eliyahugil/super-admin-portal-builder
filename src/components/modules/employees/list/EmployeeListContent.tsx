
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeeListTable } from './EmployeeListTable';

// Use the same Employee interface as the parent component
interface Employee {
  id: string;
  business_id: string;
  employee_id?: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  employee_type: string;
  is_active: boolean;
  hire_date: string | null;
  weekly_hours_required: number | null;
  notes: string | null;
  main_branch?: { name: string } | null;
  branch_assignments?: Array<{
    branch: { name: string };
    role_name: string;
    is_active: boolean;
  }>;
  weekly_tokens?: Array<{
    token: string;
    week_start_date: string;
    week_end_date: string;
    is_active: boolean;
  }>;
  employee_notes?: Array<{
    id: string;
    content: string;
    note_type: string;
    created_at: string;
  }>;
  salary_info?: {
    hourly_rate?: number;
    monthly_salary?: number;
    currency?: string;
  };
}

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
    <div className="space-y-4">
      {/* Results Summary */}
      {searchTerm && (
        <div className="text-sm text-gray-600">
          נמצאו {employees.length} תוצאות מתוך {totalEmployees} עובדים
        </div>
      )}

      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
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
