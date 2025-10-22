import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export function useRawMaterials() {
  const { businessId } = useCurrentBusiness();

  return useQuery({
    queryKey: ['raw-materials', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raw_materials')
        .select('*')
        .eq('business_id', businessId!)
        .order('material_name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });
}
