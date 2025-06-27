
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export const useEmployeeStats = (selectedBusinessId?: string | null) => {
  const { businessId: contextBusinessId } = useCurrentBusiness();
  const effectiveBusinessId = selectedBusinessId || contextBusinessId;

  return useQuery({
    queryKey: ['employee-stats', effectiveBusinessId],
    queryFn: async () => {
      if (!effectiveBusinessId) {
        console.log('❌ No business ID available for employee stats');
        return {
          totalEmployees: 0,
          activeEmployees: 0,
          inactiveEmployees: 0,
          archivedEmployees: 0,
        };
      }

      console.log('📊 Fetching employee stats for business:', effectiveBusinessId);

      try {
        // Get all employees for the business
        const { data: employees, error } = await supabase
          .from('employees')
          .select('id, is_active, is_archived')
          .eq('business_id', effectiveBusinessId);

        if (error) {
          console.error('❌ Error fetching employee stats:', error);
          throw error;
        }

        if (!employees) {
          console.log('⚠️ No employees data returned');
          return {
            totalEmployees: 0,
            activeEmployees: 0,
            inactiveEmployees: 0,
            archivedEmployees: 0,
          };
        }

        // Calculate statistics
        const totalEmployees = employees.filter(emp => !emp.is_archived).length;
        const activeEmployees = employees.filter(emp => emp.is_active && !emp.is_archived).length;
        const inactiveEmployees = employees.filter(emp => !emp.is_active && !emp.is_archived).length;
        const archivedEmployees = employees.filter(emp => emp.is_archived).length;

        const stats = {
          totalEmployees,
          activeEmployees,
          inactiveEmployees,
          archivedEmployees,
        };

        console.log('📊 Employee stats calculated:', stats);
        return stats;

      } catch (error) {
        console.error('💥 Error in employee stats query:', error);
        throw error;
      }
    },
    enabled: !!effectiveBusinessId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });
};
