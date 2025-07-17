
import type { Employee } from '@/types/employee';
import { useEmployeeListPreferences } from '@/hooks/useEmployeeListPreferences';
import { useEmployeeListPagination } from './useEmployeeListPagination';
import { 
  useEmployeeFiltering, 
  useEmployeeSorting, 
  useEmployeeSelection, 
  useEmployeeActions 
} from './hooks';

export const useEmployeeListLogic = (employees: Employee[], onRefetch: () => void, businessId?: string | null, forceStatusFilter?: 'all' | 'active' | 'inactive') => {
  // השתמש ב-hook החדש לניהול העדפות
  const {
    preferences,
    updatePageSize,
    updateFilters,
    toggleAdvancedFilters,
    resetFilters,
  } = useEmployeeListPreferences(businessId);

  // דרוס את סטטוס הפילטר אם נדרש
  const effectiveFilters = forceStatusFilter 
    ? { ...preferences.filters, status: forceStatusFilter }
    : preferences.filters;

  console.log('🔍 useEmployeeListLogic - filters applied:', {
    sortBy: preferences.filters.sortBy,
    sortOrder: preferences.filters.sortOrder,
    totalEmployees: employees.length
  });

  // פילטור העובדים
  const filteredEmployees = useEmployeeFiltering(employees, effectiveFilters);

  // מיון העובדים
  const sortedEmployees = useEmployeeSorting(filteredEmployees, effectiveFilters.sortBy, effectiveFilters.sortOrder);

  console.log('📊 useEmployeeListLogic - after sorting:', {
    sortBy: effectiveFilters.sortBy,
    sortOrder: effectiveFilters.sortOrder,
    forceStatusFilter,
    effectiveStatus: effectiveFilters.status,
    filteredCount: sortedEmployees.length,
    firstEmployee: sortedEmployees[0] ? `${sortedEmployees[0].first_name} ${sortedEmployees[0].last_name}` : 'none',
    lastEmployee: sortedEmployees[sortedEmployees.length - 1] ? `${sortedEmployees[sortedEmployees.length - 1].first_name} ${sortedEmployees[sortedEmployees.length - 1].last_name}` : 'none'
  });

  // השתמש ב-pagination hook עם הנתונים המסוננים והממוינים
  const {
    paginatedEmployees,
    currentPage,
    totalPages,
    totalEmployees: filteredCount,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = useEmployeeListPagination({
    employees: sortedEmployees, // כבר ממוין וסנן
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
    handleBulkActivate,
    handleBulkDeactivate,
    loading,
  } = useEmployeeActions(onRefetch, selectedEmployees, clearSelectedEmployees);

  // פונקציה לטיפול במיון
  const handleSort = (sortBy: typeof effectiveFilters.sortBy) => {
    const newSortOrder = 
      effectiveFilters.sortBy === sortBy && effectiveFilters.sortOrder === 'asc' 
        ? 'desc' 
        : 'asc';
    
    console.log('🔄 handleSort in useEmployeeListLogic:', { sortBy, newSortOrder, currentSortBy: effectiveFilters.sortBy });
    updateFilters({ sortBy, sortOrder: newSortOrder });
  };

  return {
    // נתונים
    allEmployees: employees,
    filteredEmployees: sortedEmployees,
    paginatedEmployees,
    totalEmployees: employees.length,
    filteredCount,
    
    // העדפות ופילטרים
    preferences: { ...preferences, filters: effectiveFilters },
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
    handleBulkActivate,
    handleBulkDeactivate,
    clearSelectedEmployees,
    
    // מיון
    handleSort,
    
    // מצב
    loading,
  };
};
