
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/types/employee';
import { useEmployeeListPagination } from './useEmployeeListPagination';
import { useGenericArchive } from '@/hooks/useGenericArchive';
import { useEmployeeListPreferences, type EmployeeListFilters } from '@/hooks/useEmployeeListPreferences';

const getTenureInMonths = (hireDate: string | null, createdAt: string): number => {
  const startDate = hireDate ? new Date(hireDate) : new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
  return diffMonths;
};

const filterEmployeesByTenure = (employees: Employee[], tenure: EmployeeListFilters['tenure']): Employee[] => {
  if (tenure === 'all') return employees;
  
  return employees.filter(employee => {
    const months = getTenureInMonths(employee.hire_date, employee.created_at);
    
    switch (tenure) {
      case 'new':
        return months <= 3;
      case 'experienced':
        return months > 3 && months <= 12;
      case 'veteran':
        return months > 12;
      default:
        return true;
    }
  });
};

const sortEmployees = (employees: Employee[], sortBy: EmployeeListFilters['sortBy'], sortOrder: EmployeeListFilters['sortOrder']): Employee[] => {
  const sorted = [...employees].sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case 'name':
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        compareValue = nameA.localeCompare(nameB, 'he');
        break;
      case 'hire_date':
        const dateA = new Date(a.hire_date || a.created_at);
        const dateB = new Date(b.hire_date || b.created_at);
        compareValue = dateA.getTime() - dateB.getTime();
        break;
      case 'employee_type':
        compareValue = a.employee_type.localeCompare(b.employee_type);
        break;
      case 'created_at':
        compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      default:
        compareValue = 0;
    }
    
    return sortOrder === 'desc' ? -compareValue : compareValue;
  });
  
  return sorted;
};

export const useEmployeeListLogicEnhanced = (employees: Employee[], onRefetch: () => void, businessId?: string | null) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // השתמש ב-hook החדש לניהול העדפות
  const {
    preferences,
    updatePageSize,
    updateFilters,
    toggleAdvancedFilters,
    resetFilters,
  } = useEmployeeListPreferences(businessId);

  // פילטור ומיון העובדים
  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees;

    // חיפוש טקסט
    if (preferences.filters.searchTerm.trim()) {
      const searchLower = preferences.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(employee => {
        const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
        const email = employee.email?.toLowerCase() || '';
        const phone = employee.phone?.toLowerCase() || '';
        const employeeId = employee.employee_id?.toLowerCase() || '';

        return fullName.includes(searchLower) ||
               email.includes(searchLower) ||
               phone.includes(searchLower) ||
               employeeId.includes(searchLower);
      });
    }

    // סינון לפי סוג עובד
    if (preferences.filters.employeeType !== 'all') {
      filtered = filtered.filter(employee => employee.employee_type === preferences.filters.employeeType);
    }

    // סינון לפי סטטוס
    if (preferences.filters.status !== 'all') {
      if (preferences.filters.status === 'active') {
        filtered = filtered.filter(employee => employee.is_active);
      } else if (preferences.filters.status === 'inactive') {
        filtered = filtered.filter(employee => !employee.is_active);
      }
    }

    // סינון לפי וותק
    filtered = filterEmployeesByTenure(filtered, preferences.filters.tenure);

    // מיון
    filtered = sortEmployees(filtered, preferences.filters.sortBy, preferences.filters.sortOrder);

    return filtered;
  }, [employees, preferences.filters]);

  // השתמש ב-pagination hook עם הנתונים המסוננים
  const {
    paginatedEmployees,
    currentPage,
    totalPages,
    totalEmployees: filteredCount,
    handlePageChange,
  } = useEmployeeListPagination({
    employees: filteredAndSortedEmployees,
    searchTerm: '', // כבר סיננו לפי חיפוש
    pageSize: preferences.pageSize,
  });

  // בחירת עובדים
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

  // שימוש ב-archive hook
  const { archiveEntity, isArchiving } = useGenericArchive({
    tableName: 'employees',
    entityName: 'העובד',
    queryKey: ['employees'],
    getEntityDisplayName: (emp: Employee) => `${emp.first_name} ${emp.last_name}`,
    onSuccess: () => {
      console.log('🔄 Archive success callback - triggering refetch');
      onRefetch();
    }
  });

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedEmployees.map(emp => emp.id));
      setSelectedEmployees(allIds);
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    
    if (!confirm(`האם אתה בטוח שברצונך להעביר את ${employeeName} לארכיון?`)) {
      return;
    }

    try {
      const newSelected = new Set(selectedEmployees);
      newSelected.delete(employee.id);
      setSelectedEmployees(newSelected);

      await archiveEntity(employee);
    } catch (error) {
      console.error('Error archiving employee:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעביר את העובד לארכיון',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmployees.size === 0) return;

    const selectedEmployeesList = filteredAndSortedEmployees.filter(emp => selectedEmployees.has(emp.id));
    const employeeNames = selectedEmployeesList.map(emp => `${emp.first_name} ${emp.last_name}`).join(', ');

    if (!confirm(`האם אתה בטוח שברצונך להעביר ${selectedEmployees.size} עובדים לארכיון?\n\n${employeeNames}`)) {
      return;
    }

    setLoading(true);
    
    try {
      setSelectedEmployees(new Set());

      for (const employee of selectedEmployeesList) {
        try {
          await archiveEntity(employee);
        } catch (error) {
          console.error('Error archiving employee:', employee.id, error);
        }
      }

      toast({
        title: 'הצלחה',
        description: `הועברו ${selectedEmployees.size} עובדים לארכיון`,
      });

    } catch (error) {
      console.error('Error bulk archiving:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    // נתונים
    allEmployees: employees,
    filteredEmployees: filteredAndSortedEmployees,
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
    handlePageChange,
    
    // בחירה ופעולות
    selectedEmployees,
    handleSelectEmployee,
    handleSelectAll,
    handleDeleteEmployee,
    handleBulkDelete,
    
    // מצב
    loading: loading || isArchiving,
  };
};
