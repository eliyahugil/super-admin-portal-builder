
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessId } from '@/hooks/useBusinessId';

export const useEmployeeStats = (selectedBusinessId?: string | null) => {
  const contextBusinessId = useBusinessId();
  const effectiveBusinessId = selectedBusinessId || contextBusinessId;

  return useQuery({
    queryKey: ['employee-stats', effectiveBusinessId],
    queryFn: async () => {
      if (!effectiveBusinessId) {
        return {
          totalEmployees: 0,
          activeEmployees: 0,
          inactiveEmployees: 0,
          archivedEmployees: 0,
        };
      }

      console.log('📊 Fetching employee stats for business:', effectiveBusinessId);

      const { data: employees, error } = await supabase
        .from('employees')
        .select('id, is_active, is_archived')
        .eq('business_id', effectiveBusinessId);

      if (error) {
        console.error('❌ Error fetching employee stats:', error);
        throw error;
      }

      if (!employees) {
        return {
          totalEmployees: 0,
          activeEmployees: 0,
          inactiveEmployees: 0,
          archivedEmployees: 0,
        };
      }

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

      console.log('📊 Stats calculated:', stats);
      return stats;
    },
    enabled: !!effectiveBusinessId,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
