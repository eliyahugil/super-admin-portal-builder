
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useEmployeeContext } from '@/hooks/useEmployeeContext';
import type { Branch } from '@/types/branch';

export const useBranchesData = (selectedBusinessId?: string | null) => {
  const { businessId: contextBusinessId, isSuperAdmin } = useCurrentBusiness();
  const { isEmployee, employeeId, assignedBranchIds } = useEmployeeContext();
  
  // Use selectedBusinessId if provided (for super admin), otherwise use context business ID
  const businessId = selectedBusinessId || contextBusinessId;

  console.log('🏢 useBranchesData - Query parameters:', {
    selectedBusinessId,
    contextBusinessId,
    finalBusinessId: businessId,
    isSuperAdmin,
    isEmployee,
    employeeId,
    assignedBranchIds
  });

  return useQuery({
    queryKey: ['branches', businessId, selectedBusinessId, isEmployee, employeeId],
    queryFn: async (): Promise<Branch[]> => {
      console.log('📊 useBranchesData - Starting query...');
      
      // For super admin without selected business, return empty array
      if (isSuperAdmin && !businessId) {
        console.log('🔒 Super admin without selected business - returning empty branches');
        return [];
      }

      if (!businessId) {
        console.log('❌ No business ID available');
        throw new Error('Business ID required');
      }

      let query = supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .eq('business_id', businessId);

      // CRITICAL: If this is an employee, filter only their assigned branches
      if (isEmployee && assignedBranchIds.length > 0) {
        console.log('🔒 Employee access - filtering branches by assignments:', assignedBranchIds);
        query = query.in('id', assignedBranchIds);
      }

      // Order by name
      query = query.order('name', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching branches:', error);
        throw error;
      }

      console.log('✅ Branches data fetched:', {
        count: data?.length || 0,
        isEmployee,
        filteredByAssignments: isEmployee && assignedBranchIds.length > 0
      });

      return (data || []) as Branch[];
    },
    enabled: !!businessId || (isSuperAdmin && selectedBusinessId === null),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
