
import { useState, useMemo, useEffect } from 'react';
import type { Employee } from '@/types/employee';

export type PageSize = 10 | 25 | 50 | 100 | 'unlimited';

interface UseEmployeeListPaginationProps {
  employees: Employee[];
  searchTerm: string;
  pageSize?: PageSize;
}

export const useEmployeeListPagination = ({
  employees,
  searchTerm,
  pageSize = 25,
}: UseEmployeeListPaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter employees based on search term (if needed - usually already filtered)
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    
    return employees.filter((employee) => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
      const employeeId = employee.employee_id?.toLowerCase() || '';
      const phone = employee.phone?.toLowerCase() || '';
      const email = employee.email?.toLowerCase() || '';

      return (
        fullName.includes(searchLower) ||
        employeeId.includes(searchLower) ||
        phone.includes(searchLower) ||
        email.includes(searchLower)
      );
    });
  }, [employees, searchTerm]);

  // Calculate pagination
  const totalEmployees = filteredEmployees.length;
  const totalPages = pageSize === 'unlimited' ? 1 : Math.ceil(totalEmployees / pageSize);
  
  const paginatedEmployees = useMemo(() => {
    if (pageSize === 'unlimited') {
      return filteredEmployees;
    }
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage, pageSize]);

  // Reset to first page when page size changes
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (newPageSize: PageSize) => {
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Reset current page when employees change significantly
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return {
    paginatedEmployees,
    currentPage,
    totalPages,
    totalEmployees,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  };
};
