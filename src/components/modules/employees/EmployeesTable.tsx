
import React from 'react';
import { Card } from '@/components/ui/card';
import { EmployeesTableHeader } from './table/EmployeesTableHeader';
import { EmployeesTableFilters } from './table/EmployeesTableFilters';
import { EmployeesTableContent } from './table/EmployeesTableContent';
import { useEmployeesTableLogic } from './table/useEmployeesTableLogic';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface EmployeesTableProps {
  selectedBusinessId?: string | null;
}

export const EmployeesTable: React.FC<EmployeesTableProps> = ({ selectedBusinessId }) => {
  const { isSuperAdmin } = useCurrentBusiness();
  
  const {
    employees,
    filteredEmployees,
    loading,
    search,
    setSearch,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    handleCreateEmployee,
    handleTokenSent,
  } = useEmployeesTableLogic(isSuperAdmin ? selectedBusinessId : undefined);

  if (loading) {
    return (
      <Card dir="rtl">
        <EmployeesTableHeader
          employeesCount={0}
          onCreateEmployee={handleCreateEmployee}
        />
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card dir="rtl">
      <EmployeesTableHeader
        employeesCount={employees.length}
        onCreateEmployee={handleCreateEmployee}
      />
      
      <EmployeesTableFilters
        search={search}
        onSearchChange={setSearch}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
      />
      
      <EmployeesTableContent
        filteredEmployees={filteredEmployees}
        search={search}
        filterType={filterType}
        filterStatus={filterStatus}
        onCreateEmployee={handleCreateEmployee}
        onTokenSent={handleTokenSent}
      />
    </Card>
  );
};
