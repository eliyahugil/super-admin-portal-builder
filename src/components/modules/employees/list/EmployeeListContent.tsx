
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeeListTable } from './EmployeeListTable';
import { EmployeeListPagination } from './EmployeeListPagination';
import type { Employee } from '@/types/employee';
import type { PageSize } from './useEmployeeListPagination';

interface EmployeeListContentProps {
  employees: Employee[];
  searchTerm: string;
  selectedEmployees: Set<string>;
  onSelectEmployee: (employeeId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteEmployee: (employee: Employee) => void;
  onRefetch: () => void;
  loading: boolean;
  totalEmployees: number;
  currentPage: number;
  totalPages: number;
  pageSize: PageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}

export const EmployeeListContent: React.FC<EmployeeListContentProps> = ({
  employees,
  searchTerm,
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  onDeleteEmployee,
  onRefetch,
  loading,
  totalEmployees,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  if (loading && employees.length === 0) {
    return (
      <Card dir="rtl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <Card>
        <div className="p-4 bg-gray-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              סה"כ {totalEmployees} עובדים
            </span>
          </div>
        </div>
        
        <CardContent>
          <EmployeeListTable
            employees={employees}
            selectedEmployees={selectedEmployees}
            onSelectEmployee={onSelectEmployee}
            onSelectAll={onSelectAll}
            onDeleteEmployee={onDeleteEmployee}
            onRefetch={onRefetch}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      <EmployeeListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalEmployees={totalEmployees}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
