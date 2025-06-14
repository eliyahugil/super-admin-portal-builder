
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useBranchesData } from '@/hooks/useBranchesData';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import { useArchivedEmployees } from '@/hooks/useArchivedEmployees';

export const useEmployeeManagementLogic = () => {
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

  return {
    // State
    activeTab,
    setActiveTab,
    createEmployeeOpen,
    setCreateEmployeeOpen,
    createBranchOpen,
    setCreateBranchOpen,
    
    // Data
    employees,
    archivedEmployees,
    branches,
    activeEmployees,
    inactiveEmployees,
    businessId,
    profile,
    
    // Loading states
    isLoading,
    
    // Handlers
    handleEmployeeCreated,
    handleBranchCreated,
    refetchEmployees,
    refetchBranches
  };
};
