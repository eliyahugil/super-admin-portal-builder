
import type { Employee } from '@/types/employee';
import { useEmployeeListPreferences } from '@/hooks/useEmployeeListPreferences';
import { useEmployeeListPagination } from './useEmployeeListPagination';
import { 
  useEmployeeFiltering, 
  useEmployeeSorting, 
  useEmployeeSelection, 
  useEmployeeActions 
} from './hooks';

export const useEmployeeListLogic = (employees: Employee[], onRefetch: () => void, businessId?: string | null) => {
  // השתמש ב-hook החדש לניהול העדפות
  const {
    preferences,
    updatePageSize,
    updateFilters,
    toggleAdvancedFilters,
    resetFilters,
  } = useEmployeeListPreferences(businessId);

  // פילטור העובדים
  const filteredEmployees = useEmployeeFiltering(employees, preferences.filters);

  // מיון העובדים
  const sortedEmployees = useEmployeeSorting(filteredEmployees, preferences.filters.sortBy, preferences.filters.sortOrder);

  // השתמש ב-pagination hook עם הנתונים המסוננים
  const {
    paginatedEmployees,
    currentPage,
    totalPages,
    totalEmployees: filteredCount,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = useEmployeeListPagination({
    employees: sortedEmployees,
    searchTerm: '', // כבר סיננו לפי חיפוש
    pageSize: preferences.pageSize,
  });

  // בחירת עובדים
  const {
    selectedEmployees,
    handleSelectEmployee,
    handleSelectAll,
    clearSelectedEmployees,
  } = useEmployeeSelection();

  // פעולות על עובדים
  const {
    handleDeleteEmployee,
    handleBulkDelete,
    loading,
  } = useEmployeeActions(onRefetch, selectedEmployees, clearSelectedEmployees);

  return {
    // נתונים
    allEmployees: employees,
    filteredEmployees: sortedEmployees,
    paginatedEmployees,
    totalEmployees: employees.length,
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
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    
    // בחירה ופעולות
    selectedEmployees,
    handleSelectEmployee: (employeeId: string, checked: boolean) => handleSelectEmployee(employeeId, checked),
    handleSelectAll: (checked: boolean) => handleSelectAll(paginatedEmployees, checked),
    handleDeleteEmployee,
    handleBulkDelete: () => handleBulkDelete(sortedEmployees),
    clearSelectedEmployees,
    
    // מצב
    loading,
  };
};
