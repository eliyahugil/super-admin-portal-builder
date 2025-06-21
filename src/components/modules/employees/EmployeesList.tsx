
import React from 'react';
import { EmployeeListHeader } from './list/EmployeeListHeader';
import { EmployeeListContent } from './list/EmployeeListContent';
import { useEmployeeListLogic } from './list/useEmployeeListLogic';
import type { Employee } from '@/types/employee';
import type { Branch } from '@/types/branch';

interface EmployeesListProps {
  employees: Employee[];
  onRefetch: () => void;
  branches: Branch[];
}

export const EmployeesList: React.FC<EmployeesListProps> = ({
  employees,
  onRefetch,
  branches,
}) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedEmployees,
    paginatedEmployees,
    loading,
    handleSelectEmployee,
    handleSelectAll,
    handleDeleteEmployee,
    handleBulkDelete,
    // Pagination props
    currentPage,
    totalPages,
    totalEmployees,
    pageSize,
    handlePageSizeChange,
    handlePageChange,
  } = useEmployeeListLogic(employees, onRefetch);

  console.log('📋 EmployeesList rendering with:', {
    employeesCount: employees.length,
    searchTerm,
    selectedCount: selectedEmployees.size,
    branchesCount: branches.length,
    currentPage,
    pageSize,
    totalEmployees
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
        employees={paginatedEmployees}
        searchTerm={searchTerm}
        selectedEmployees={selectedEmployees}
        onSelectEmployee={handleSelectEmployee}
        onSelectAll={handleSelectAll}
        onDeleteEmployee={handleDeleteEmployee}
        onRefetch={onRefetch}
        loading={loading}
        totalEmployees={totalEmployees}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};
