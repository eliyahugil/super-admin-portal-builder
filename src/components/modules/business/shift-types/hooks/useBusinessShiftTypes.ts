import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBusinessShiftTypes = (businessId: string | null) => {
  return useQuery({
    queryKey: ['business-shift-types', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('business_shift_types')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('start_time');

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });
};