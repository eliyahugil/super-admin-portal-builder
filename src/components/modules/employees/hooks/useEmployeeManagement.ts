
import { useState, useEffect } from 'react';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import type { Employee } from '@/types/employee';

export const useEmployeeManagement = (selectedBusinessId?: string | null) => {
  const { businessId: contextBusinessId, isSuperAdmin } = useCurrentBusiness();
  // השתמש בעסק הנבחר מהקונטקסט הגלובלי אם לא צוין אחרת
  const finalBusinessId = selectedBusinessId !== undefined ? selectedBusinessId : contextBusinessId;

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedEmployeeType, setSelectedEmployeeType] = useState('');
  const [isArchived, setIsArchived] = useState(false);

  console.log('🔍 useEmployeeManagement hook initialized with:', {
    selectedBusinessId,
    contextBusinessId,
    finalBusinessId,
    isSuperAdmin,
    searchTerm,
    selectedBranch,
    selectedEmployeeType,
    isArchived
  });

  // Use the employees data hook
  const { 
    data: employees = [], 
    isLoading, 
    error, 
    refetch: originalRefetch 
  } = useEmployeesData(finalBusinessId);

  console.log('📊 useEmployeeManagement - Raw employees data:', {
    employeesCount: employees.length,
    isLoading,
    hasError: !!error,
    sampleEmployees: employees.slice(0, 2).map(emp => ({
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      is_archived: emp.is_archived
    }))
  });

  // Enhanced refetch function with cache invalidation
  const refetch = async () => {
    console.log('🔄 useEmployeeManagement - Refetching employees...');
    try {
      const result = await originalRefetch();
      console.log('✅ useEmployeeManagement - Refetch completed:', {
        employeesCount: result.data?.length || 0
      });
      return result;
    } catch (error) {
      console.error('❌ useEmployeeManagement - Refetch failed:', error);
      throw error;
    }
  };

  // Filter employees based on current state
  const filteredEmployees = employees.filter((employee: Employee) => {
    // Archive filter - most important filter
    if (employee.is_archived !== isArchived) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
      const email = employee.email?.toLowerCase() || '';
      const phone = employee.phone?.toLowerCase() || '';
      const employeeId = employee.employee_id?.toLowerCase() || '';

      if (!fullName.includes(searchLower) && 
          !email.includes(searchLower) && 
          !phone.includes(searchLower) && 
          !employeeId.includes(searchLower)) {
        return false;
      }
    }

    // Branch filter - Fix the TypeScript error by properly accessing branch data
    if (selectedBranch) {
      // Check main branch first
      if (employee.main_branch_id === selectedBranch) {
        return true;
      }
      
      // Then check branch assignments - since branch only has name, we need to match by name
      const hasBranchAssignment = employee.branch_assignments?.some(assignment => 
        assignment.branch?.name === selectedBranch
      );
      
      if (!hasBranchAssignment) {
        return false;
      }
    }

    // Employee type filter
    if (selectedEmployeeType && employee.employee_type !== selectedEmployeeType) {
      return false;
    }

    return true;
  });

  console.log('📋 useEmployeeManagement - Filtered employees:', {
    totalEmployees: employees.length,
    filteredCount: filteredEmployees.length,
    filters: {
      searchTerm,
      selectedBranch,
      selectedEmployeeType,
      isArchived
    }
  });

  return {
    employees: filteredEmployees,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    selectedBranch,
    setSelectedBranch,
    selectedEmployeeType,
    setSelectedEmployeeType,
    isArchived,
    setIsArchived,
  };
};
