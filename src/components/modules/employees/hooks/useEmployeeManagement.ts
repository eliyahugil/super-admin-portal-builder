
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import type { Employee, EmployeeType } from '@/types/employee';
import { normalizeEmployee } from '@/types/employee';

export const useEmployeeManagement = () => {
  const { businessId, isSuperAdmin } = useCurrentBusiness();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedEmployeeType, setSelectedEmployeeType] = useState('');
  const [isArchived, setIsArchived] = useState(false);

  // Type guard for safe EmployeeType conversion
  const isValidEmployeeType = (value: string): value is EmployeeType => {
    return ['permanent', 'temporary', 'contractor', 'youth'].includes(value);
  };

  const { data: employees, isLoading, error, refetch } = useQuery({
    queryKey: ['employees', businessId, searchTerm, selectedBranch, selectedEmployeeType, isArchived],
    queryFn: async (): Promise<Employee[]> => {
      if (!businessId && !isSuperAdmin) {
        console.log('No business ID and not super admin, returning empty array');
        return [];
      }

      console.log('Fetching employees with filters:', {
        businessId,
        searchTerm,
        selectedBranch,
        selectedEmployeeType,
        isArchived,
        isSuperAdmin
      });

      let query = supabase
        .from('employees')
        .select(`
          *,
          main_branch:branches(name),
          employee_branch_assignments(
            branch:branches(name)
          )
        `);

      // Apply business filter for non-super-admin users
      if (!isSuperAdmin && businessId) {
        query = query.eq('business_id', businessId);
      }

      // Apply archive filter
      query = query.eq('is_archived', isArchived);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      // Apply branch filter
      if (selectedBranch) {
        query = query.eq('main_branch_id', selectedBranch);
      }

      // Apply employee type filter with safe type checking
      if (selectedEmployeeType && isValidEmployeeType(selectedEmployeeType)) {
        query = query.eq('employee_type', selectedEmployeeType);
      }

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }

      console.log('Employees fetched successfully:', data?.length || 0);
      
      // Normalize the data to ensure consistent typing
      return (data || []).map(normalizeEmployee);
    },
    enabled: !!businessId || isSuperAdmin,
  });

  return {
    employees: employees || [],
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
