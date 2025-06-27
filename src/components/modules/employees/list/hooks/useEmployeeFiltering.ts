
import { useMemo } from 'react';
import type { Employee } from '@/types/employee';
import type { EmployeeListFilters } from '@/hooks/useEmployeeListPreferences';

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

export const useEmployeeFiltering = (employees: Employee[], filters: EmployeeListFilters) => {
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // חיפוש טקסט
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
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
    if (filters.employeeType !== 'all') {
      filtered = filtered.filter(employee => employee.employee_type === filters.employeeType);
    }

    // סינון לפי סטטוס
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filtered = filtered.filter(employee => employee.is_active);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(employee => !employee.is_active);
      }
    }

    // סינון לפי וותק
    filtered = filterEmployeesByTenure(filtered, filters.tenure);

    return filtered;
  }, [employees, filters]);

  return filteredEmployees;
};
