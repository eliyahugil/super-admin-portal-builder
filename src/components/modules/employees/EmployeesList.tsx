
import React from 'react';
import { EmployeeListHeader } from './list/EmployeeListHeader';
import { EmployeeListContent } from './list/EmployeeListContent';
import { useEmployeeListLogic } from './list/useEmployeeListLogic';
import type { Employee } from '@/types/employee';

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
    <div className="space-y-4" dir="rtl">
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
