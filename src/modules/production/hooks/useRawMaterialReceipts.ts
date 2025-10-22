import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { RawMaterialReceipt } from '@/types/production';

export function useRawMaterialReceipts() {
  const { businessId } = useCurrentBusiness();

  return useQuery({
    queryKey: ['raw-material-receipts', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raw_material_receipts')
        .select('*')
        .eq('business_id', businessId!)
        .order('received_date', { ascending: false });
      
      if (error) throw error;
      return (data || []) as RawMaterialReceipt[];
    },
    enabled: !!businessId,
  });
}

export function useCreateRawMaterialReceipt() {
  const queryClient = useQueryClient();
  const { businessId } = useCurrentBusiness();

  return useMutation({
    mutationFn: async (payload: Omit<RawMaterialReceipt, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('raw_material_receipts')
        .insert({ ...payload, business_id: businessId })
        .select()
        .single();
      
      if (error) throw error;
      return data as RawMaterialReceipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw-material-receipts', businessId] });
    },
  });
}
