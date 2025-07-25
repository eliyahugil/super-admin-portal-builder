
import { useMemo } from 'react';
import type { Employee } from '@/types/employee';
import type { EmployeeListFilters } from '@/hooks/useEmployeeListPreferences';

const sortEmployees = (employees: Employee[], sortBy: EmployeeListFilters['sortBy'], sortOrder: EmployeeListFilters['sortOrder']): Employee[] => {
  console.log('🔄 Sorting employees:', { count: employees.length, sortBy, sortOrder });
  
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
  
  console.log('✅ Sorted employees result:', {
    sortBy,
    sortOrder,
    firstEmployee: sorted[0] ? `${sorted[0].first_name} ${sorted[0].last_name}` : 'none',
    lastEmployee: sorted[sorted.length - 1] ? `${sorted[sorted.length - 1].first_name} ${sorted[sorted.length - 1].last_name}` : 'none'
  });
  
  return sorted;
};

export const useEmployeeSorting = (employees: Employee[], sortBy: EmployeeListFilters['sortBy'], sortOrder: EmployeeListFilters['sortOrder']) => {
  const sortedEmployees = useMemo(() => {
    return sortEmployees(employees, sortBy, sortOrder);
  }, [employees, sortBy, sortOrder]);

  return sortedEmployees;
};
