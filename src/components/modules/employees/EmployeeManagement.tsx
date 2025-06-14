
import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useBranchesData } from '@/hooks/useBranchesData';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import { useArchivedEmployees } from '@/hooks/useArchivedEmployees';
import { CreateEmployeeDialog } from './CreateEmployeeDialog';
import { CreateBranchDialog } from './CreateBranchDialog';
import { ManagementToolsSection } from './ManagementToolsSection';
import { EmployeeManagementHeader } from './EmployeeManagementHeader';
import { EmployeeStatsCards } from './EmployeeStatsCards';
import { EmployeeTabsContent } from './EmployeeTabsContent';
import { EmployeeManagementLoading } from './EmployeeManagementLoading';
import { EmployeeManagementEmptyState } from './EmployeeManagementEmptyState';
import { Branch } from '@/types/branch';

export const EmployeeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [createEmployeeOpen, setCreateEmployeeOpen] = useState(false);
  const [createBranchOpen, setCreateBranchOpen] = useState(false);
  const { profile } = useAuth();
  const { businessId } = useCurrentBusiness();

  // Only fetch data when we have a business ID
  const { 
    data: employees = [], 
    isLoading: employeesLoading, 
    refetch: refetchEmployees 
  } = useEmployeesData(businessId);

  const { 
    data: archivedEmployees = [], 
    isLoading: archivedLoading 
  } = useArchivedEmployees(businessId);

  const { 
    data: branches = [], 
    isLoading: branchesLoading, 
    refetch: refetchBranches 
  } = useBranchesData(businessId);

  console.log('EmployeeManagement - Current state:', {
    businessId,
    employeesCount: employees.length,
    archivedCount: archivedEmployees.length,
    branchesCount: branches.length,
    activeTab,
    userRole: profile?.role
  });

  const activeEmployees = employees.filter(emp => emp.is_active);
  const inactiveEmployees = employees.filter(emp => !emp.is_active);

  const handleEmployeeCreated = () => {
    refetchEmployees();
    setCreateEmployeeOpen(false);
  };

  const handleBranchCreated = () => {
    refetchBranches();
    setCreateBranchOpen(false);
  };

  const isLoading = employeesLoading || branchesLoading || archivedLoading;

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
