
import React from 'react';
import { Card } from '@/components/ui/card';
import { EmployeesTableHeader } from './EmployeesTableHeader';
import { EmployeesTableFilters } from './EmployeesTableFilters';
import { EmployeesTableContent } from './EmployeesTableContent';
import { useEmployeesTableLogic } from './useEmployeesTableLogic';

interface EmployeesTableAdvancedProps {
  selectedBusinessId?: string | null;
}

export const EmployeesTableAdvanced: React.FC<EmployeesTableAdvancedProps> = ({ selectedBusinessId }) => {
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
  } = useEmployeesTableLogic(selectedBusinessId);

  console.log('🔍 EmployeesTableAdvanced - Using business filter:', selectedBusinessId);

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
