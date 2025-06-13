
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { EmployeesTableGrid } from './EmployeesTableGrid';

interface Employee {
  id: string;
  employee_id: string | null;
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
