
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessId } from '@/hooks/useBusinessId';
import type { Employee } from './useEmployees';

export const useInactiveEmployees = (selectedBusinessId?: string | null) => {
  const contextBusinessId = useBusinessId();
  const effectiveBusinessId = selectedBusinessId || contextBusinessId;

  return useQuery({
    queryKey: ['employees', effectiveBusinessId, 'inactive-only'],
    queryFn: async (): Promise<Employee[]> => {
      if (!effectiveBusinessId) {
        console.log('❌ No business ID available for inactive employees');
        return [];
      }

      console.log('👥 Fetching INACTIVE (non-archived) employees for business:', effectiveBusinessId);

      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          business_id,
          first_name,
          last_name,
          email,
          phone,
          address,
          employee_type,
          hire_date,
          termination_date,
          weekly_hours_required,
          notes,
          employee_id,
          id_number,
          is_active,
          is_archived,
          is_system_user,
          main_branch_id,
          created_at,
          updated_at
        `)
        .eq('business_id', effectiveBusinessId)
        .eq('is_archived', false)  // לא בארכיון
        .eq('is_active', false)    // לא פעילים
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching inactive employees:', error);
        throw error;
      }

      const inactiveEmployees = data || [];

      console.log('✅ Inactive employees fetched:', {
        total: inactiveEmployees.length,
        businessId: effectiveBusinessId,
        employees: inactiveEmployees.map(emp => ({
          id: emp.id,
          name: `${emp.first_name} ${emp.last_name}`,
          is_active: emp.is_active,
          is_archived: emp.is_archived
        }))
      });

      return inactiveEmployees;
    },
    enabled: !!effectiveBusinessId,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
