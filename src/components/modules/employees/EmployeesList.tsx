
import React from 'react';
import { EmployeeListHeader } from './list/EmployeeListHeader';
import { EmployeeListContent } from './list/EmployeeListContent';
import { useEmployeeListLogic } from './list/useEmployeeListLogic';

// Use the Employee type from the unified hook instead of defining our own
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

interface EmployeesListProps {
  employees: Employee[];
  onRefetch: () => void;
}

export const EmployeesList: React.FC<EmployeesListProps> = ({
  employees,
  onRefetch,
}) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedEmployees,
    filteredEmployees,
    loading,
    handleSelectEmployee,
    handleSelectAll,
    handleDeleteEmployee,
    handleBulkDelete,
  } = useEmployeeListLogic(employees, onRefetch);

  console.log('📋 EmployeesList rendering with:', {
    employeesCount: employees.length,
    searchTerm,
    selectedCount: selectedEmployees.size
  });

  return (
    <div className="space-y-4">
      <EmployeeListHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCount={selectedEmployees.size}
        onBulkDelete={handleBulkDelete}
        loading={loading}
      />

      <EmployeeListContent
        employees={filteredEmployees}
        searchTerm={searchTerm}
        selectedEmployees={selectedEmployees}
        onSelectEmployee={handleSelectEmployee}
        onSelectAll={handleSelectAll}
        onDeleteEmployee={handleDeleteEmployee}
        onRefetch={onRefetch}
        loading={loading}
        totalEmployees={employees.length}
      />
    </div>
  );
};
