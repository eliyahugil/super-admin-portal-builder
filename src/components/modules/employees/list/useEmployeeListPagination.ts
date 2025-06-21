
import { useState, useMemo } from 'react';
import type { Employee } from '@/types/employee';

export type PageSize = 10 | 25 | 50 | 100 | 'unlimited';

interface UseEmployeeListPaginationProps {
  employees: Employee[];
  searchTerm: string;
}

export const useEmployeeListPagination = ({
  employees,
  searchTerm,
}: UseEmployeeListPaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
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

  // Reset to first page when search changes or page size changes
  const handlePageSizeChange = (newPageSize: PageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    paginatedEmployees,
    currentPage,
    totalPages,
    totalEmployees,
    pageSize,
    handlePageSizeChange,
    handlePageChange,
  };
};
