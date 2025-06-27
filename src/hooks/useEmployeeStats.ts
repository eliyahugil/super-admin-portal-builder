
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

      console.log('📊 Fetching FRESH employee stats for business:', effectiveBusinessId);

      try {
        // Get all employees for the business with explicit filters
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

        // Calculate statistics with explicit filtering
        const nonArchivedEmployees = employees.filter(emp => !emp.is_archived);
        const archivedEmployees = employees.filter(emp => emp.is_archived);
        
        const totalEmployees = nonArchivedEmployees.length;
        const activeEmployees = nonArchivedEmployees.filter(emp => emp.is_active).length;
        const inactiveEmployees = nonArchivedEmployees.filter(emp => !emp.is_active).length;
        const archivedCount = archivedEmployees.length;

        const stats = {
          totalEmployees,
          activeEmployees,
          inactiveEmployees,
          archivedEmployees: archivedCount,
        };

        console.log('📊 Employee stats calculated:', {
          ...stats,
          totalInDb: employees.length,
          breakDown: {
            nonArchived: nonArchivedEmployees.length,
            archived: archivedEmployees.length
          }
        });
        
        return stats;

      } catch (error) {
        console.error('💥 Error in employee stats query:', error);
        throw error;
      }
    },
    enabled: !!effectiveBusinessId,
    staleTime: 10 * 1000, // 10 seconds - very short
    gcTime: 30 * 1000, // 30 seconds
    retry: 2,
    refetchOnWindowFocus: true,
    // Force fresh data on each mount
    refetchOnMount: 'always',
  });
};
