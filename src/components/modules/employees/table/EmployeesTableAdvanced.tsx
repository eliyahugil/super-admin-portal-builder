
import React from 'react';
import { Card } from '@/components/ui/card';
import { EmployeesTableHeader } from './EmployeesTableHeader';
import { EmployeesTableFilters } from './EmployeesTableFilters';
import { EmployeesTableContent } from './EmployeesTableContent';
import { useEmployeesTableLogic } from './useEmployeesTableLogic';
import { EmployeeEditDialog } from '@/modules/employees/EmployeeEditDialog';

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

  const [openCreate, setOpenCreate] = React.useState(false);

  console.log('🔍 EmployeesTableAdvanced - Using business filter:', selectedBusinessId);

  if (loading) {
    return (
      <Card dir="rtl">
        <EmployeesTableHeader
          employeesCount={0}
          onCreateEmployee={() => setOpenCreate(true)}
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
        onCreateEmployee={() => setOpenCreate(true)}
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
        onCreateEmployee={() => setOpenCreate(true)}
        onTokenSent={handleTokenSent}
      />

      <EmployeeEditDialog open={openCreate} onOpenChange={setOpenCreate} />
    </Card>
  );
};
