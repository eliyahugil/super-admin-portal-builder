
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export const useExistingEmployees = (selectedBusinessId?: string | null) => {
  const { businessId: contextBusinessId } = useCurrentBusiness();
  
  // Use selectedBusinessId if provided, otherwise use context business ID
  const businessId = selectedBusinessId || contextBusinessId;

  return useQuery({
    queryKey: ['existing-employees-full', businessId],
    queryFn: async () => {
      if (!businessId) {
        return [];
      }

      const { data, error } = await supabase
        .from('employees')
        .select('id, email, id_number, employee_id, first_name, last_name, phone, address, employee_type, hire_date, main_branch_id, notes, weekly_hours_required')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching existing employees:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
