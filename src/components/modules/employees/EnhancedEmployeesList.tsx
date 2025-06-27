
import React from 'react';
import { AdvancedEmployeeFilters } from './AdvancedEmployeeFilters';
import { EmployeeListContent } from './list/EmployeeListContent';
import { useEmployeeListLogicEnhanced } from './list/useEmployeeListLogicEnhanced';
import type { Employee } from '@/types/employee';
import type { Branch } from '@/types/branch';

interface EnhancedEmployeesListProps {
  businessId: string;
  employees: Employee[];
  onRefetch?: () => void;
  branches?: Branch[];
}

export const EnhancedEmployeesList: React.FC<EnhancedEmployeesListProps> = ({
  businessId,
  employees,
  onRefetch = () => {},
  branches = [],
}) => {
  const {
    // נתונים
    allEmployees,
    filteredEmployees,
    paginatedEmployees,
    totalEmployees,
    filteredCount,
    
    // העדפות ופילטרים
    preferences,
    updateFilters,
    updatePageSize,
    toggleAdvancedFilters,
    resetFilters,
    
    // pagination
    currentPage,
    totalPages,
    handlePageChange,
    
    // בחירה ופעולות
    selectedEmployees,
    handleSelectEmployee,
    handleSelectAll,
    handleDeleteEmployee,
    handleBulkDelete,
    clearSelectedEmployees,
    
    // מצב
    loading,
  } = useEmployeeListLogicEnhanced(employees, onRefetch, businessId);

  console.log('📋 EnhancedEmployeesList rendering with:', {
    businessId,
    totalEmployees,
    filteredCount,
    selectedCount: selectedEmployees.size,
    currentPage,
    pageSize: preferences.pageSize,
    activeFilters: Object.entries(preferences.filters).filter(([key, value]) => {
      if (key === 'searchTerm') return value.trim() !== '';
      if (key === 'sortBy' || key === 'sortOrder') return false;
      return value !== 'all';
    }).length
  });

  return (
    <div className="space-y-4" dir="rtl">
      {/* פילטרים מתקדמים */}
      <AdvancedEmployeeFilters
        filters={preferences.filters}
        onFiltersChange={updateFilters}
        onResetFilters={resetFilters}
        pageSize={preferences.pageSize}
        onPageSizeChange={updatePageSize}
        showAdvancedFilters={preferences.showAdvancedFilters}
        onToggleAdvancedFilters={toggleAdvancedFilters}
        totalEmployees={totalEmployees}
        filteredCount={filteredCount}
      />

      {/* תוכן הרשימה */}
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
        pageSize={preferences.pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={updatePageSize}
      />

      {/* כפתור מחיקה קבוצתית */}
      {selectedEmployees.size > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-4">
            <span className="text-sm font-medium">
              נבחרו {selectedEmployees.size} עובדים
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              העבר לארכיון
            </button>
            <button
              onClick={clearSelectedEmployees}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              בטל בחירה
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
