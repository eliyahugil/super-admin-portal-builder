
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
    <div
      className={`
        w-full
        flex flex-col gap-2 sm:gap-6
        pt-2 pb-4 sm:py-8
        px-1 sm:px-0
        max-w-full
      `}
      dir="rtl"
      style={{minWidth: 0}} // קריטי נגד scroll ב־X, במיוחד למובייל!
    >
      {/* Header */}
      <div className="w-full">
        <EmployeeManagementHeader />
      </div>

      {/* Stats Cards */}
      <div className="w-full">
        <EmployeeStatsCards
          totalEmployees={employees.length}
          activeEmployees={activeEmployees.length}
          inactiveEmployees={inactiveEmployees.length}
          archivedEmployees={archivedEmployees.length}
          branches={branches.length}
        />
      </div>

      {/* Management Tools */}
      <div className="w-full">
        <ManagementToolsSection 
          onCreateEmployee={() => setCreateEmployeeOpen(true)}
          onCreateBranch={() => setCreateBranchOpen(true)}
        />
      </div>

      {/* Main Content */}
      <div className="w-full">
        <EmployeeTabsContent
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          employees={employees}
          archivedEmployees={archivedEmployees}
          branches={branches}
          onRefetchEmployees={refetchEmployees}
          onRefetchBranches={refetchBranches}
          onCreateBranch={() => setCreateBranchOpen(true)}
        />
      </div>

      {/* Dialogs */}
      <CreateEmployeeDialog
        open={createEmployeeOpen}
        onOpenChange={setCreateEmployeeOpen}
        onSuccess={handleEmployeeCreated}
        branches={branches}
      />

      <CreateBranchDialog
        open={createBranchOpen}
        onOpenChange={setCreateBranchOpen}
        onSuccess={handleBranchCreated}
      />
    </div>
  );
};
