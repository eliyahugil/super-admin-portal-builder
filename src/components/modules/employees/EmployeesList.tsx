
import React from 'react';
import { EmployeeListHeader } from './list/EmployeeListHeader';
import { EmployeeListContent } from './list/EmployeeListContent';
import { useEmployeeListLogic } from './list/useEmployeeListLogic';
import type { Employee } from '@/types/employee';
import type { Branch } from '@/types/branch';

interface EmployeesListProps {
  businessId: string;
  employees: Employee[];
  onRefetch?: () => void;
  branches?: Branch[];
}

export const EmployeesList: React.FC<EmployeesListProps> = ({
  businessId,
  employees,
  onRefetch = () => {},
  branches = [],
}) => {
  const {
    preferences,
    updateFilters,
    selectedEmployees,
    paginatedEmployees,
    loading,
    handleSelectEmployee,
    handleSelectAll,
    handleDeleteEmployee,
    handleBulkDelete,
    handleSort,
    // Pagination props
    currentPage,
    totalPages,
    filteredCount,
    pageSize,
    handlePageSizeChange,
    handlePageChange,
  } = useEmployeeListLogic(employees, onRefetch, businessId);

  console.log('📋 EmployeesList rendering with:', {
    businessId,
    employeesCount: employees.length,
    searchTerm: preferences.filters.searchTerm,
    selectedCount: selectedEmployees.size,
    branchesCount: branches.length,
    currentPage,
    pageSize,
    totalEmployees: filteredCount
  });

  return (
    <div className="space-y-4" dir="rtl">
      <EmployeeListHeader
        searchTerm={preferences.filters.searchTerm}
        onSearchChange={(term) => updateFilters({ searchTerm: term })}
        selectedCount={selectedEmployees.size}
        onBulkDelete={handleBulkDelete}
        loading={loading}
      />

      <EmployeeListContent
        employees={paginatedEmployees}
        searchTerm={preferences.filters.searchTerm}
        selectedEmployees={selectedEmployees}
        onSelectEmployee={handleSelectEmployee}
        onSelectAll={handleSelectAll}
        onDeleteEmployee={handleDeleteEmployee}
        onRefetch={onRefetch}
        loading={loading}
        totalEmployees={filteredCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        sortBy={preferences.filters.sortBy}
        sortOrder={preferences.filters.sortOrder}
        onSort={handleSort}
      />
    </div>
  );
};
