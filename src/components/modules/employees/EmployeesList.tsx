
import React from 'react';
import { EmployeeListContent } from './list/EmployeeListContent';
import { BulkEmployeeActions } from './list/BulkEmployeeActions';
import { useEmployeeListLogic } from './list/useEmployeeListLogic';
import type { Employee } from '@/types/employee';
import type { Branch } from '@/types/branch';

interface EmployeesListProps {
  businessId: string;
  employees: Employee[];
  onRefetch?: () => void;
  branches?: Branch[];
  forceStatusFilter?: 'all' | 'active' | 'inactive';
}

export const EmployeesList: React.FC<EmployeesListProps> = ({
  businessId,
  employees,
  onRefetch = () => {},
  branches = [],
  forceStatusFilter,
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
    handleBulkActivate,
    handleBulkDeactivate,
    handleSort,
    // Pagination props
    currentPage,
    totalPages,
    filteredCount,
    pageSize,
    handlePageSizeChange,
    handlePageChange,
  } = useEmployeeListLogic(employees, onRefetch, businessId, forceStatusFilter);

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
      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex-1 relative max-w-md">
          <input
            type="text"
            placeholder="חיפוש עובדים..."
            value={preferences.filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="w-full p-2 pr-10 border rounded-md"
            dir="rtl"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkEmployeeActions
        selectedEmployees={selectedEmployees}
        employees={employees}
        branches={branches}
        onBulkDelete={handleBulkDelete}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onRefetch={onRefetch}
        loading={loading}
      />

      {/* Employee List Content */}
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
