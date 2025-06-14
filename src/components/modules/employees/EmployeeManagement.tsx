
import React from 'react';
import { CreateEmployeeDialog } from './CreateEmployeeDialog';
import { CreateBranchDialog } from './CreateBranchDialog';
import { ManagementToolsSection } from './ManagementToolsSection';
import { EmployeeManagementHeader } from './EmployeeManagementHeader';
import { EmployeeStatsCards } from './EmployeeStatsCards';
import { EmployeeTabsContent } from './EmployeeTabsContent';
import { EmployeeManagementLoading } from './EmployeeManagementLoading';
import { EmployeeManagementEmptyState } from './EmployeeManagementEmptyState';
import { useEmployeeManagementLogic } from './hooks/useEmployeeManagementLogic';
import { Branch } from '@/types/branch';

export const EmployeeManagement: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    createEmployeeOpen,
    setCreateEmployeeOpen,
    createBranchOpen,
    setCreateBranchOpen,
    employees,
    archivedEmployees,
    branches,
    activeEmployees,
    inactiveEmployees,
    businessId,
    isLoading,
    handleEmployeeCreated,
    handleBranchCreated,
    refetchEmployees,
    refetchBranches
  } = useEmployeeManagementLogic();

  if (!businessId) {
    return <EmployeeManagementEmptyState />;
  }

  if (isLoading) {
    return <EmployeeManagementLoading />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6" dir="rtl">
      {/* Header */}
      <EmployeeManagementHeader />

      {/* Stats Cards */}
      <EmployeeStatsCards
        totalEmployees={employees.length}
        activeEmployees={activeEmployees.length}
        inactiveEmployees={inactiveEmployees.length}
        archivedEmployees={archivedEmployees.length}
        branches={branches.length}
      />

      {/* Management Tools */}
      <ManagementToolsSection 
        onCreateEmployee={() => setCreateEmployeeOpen(true)}
        onCreateBranch={() => setCreateBranchOpen(true)}
      />

      {/* Main Content */}
      <EmployeeTabsContent
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        employees={employees}
        archivedEmployees={archivedEmployees}
        branches={branches as Branch[]}
        onRefetchEmployees={refetchEmployees}
        onRefetchBranches={refetchBranches}
        onCreateBranch={() => setCreateBranchOpen(true)}
      />

      {/* Dialogs */}
      <CreateEmployeeDialog
        open={createEmployeeOpen}
        onOpenChange={setCreateEmployeeOpen}
        onSuccess={handleEmployeeCreated}
        branches={branches as Branch[]}
      />

      <CreateBranchDialog
        open={createBranchOpen}
        onOpenChange={setCreateBranchOpen}
        onSuccess={handleBranchCreated}
      />
    </div>
  );
};
