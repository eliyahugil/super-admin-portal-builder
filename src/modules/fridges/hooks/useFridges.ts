import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Fridge } from '@/types/fridges';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export function useFridges() {
  const { businessId } = useCurrentBusiness();

  return useQuery({
    queryKey: ['fridges', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fridges')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return (data || []) as Fridge[];
    },
    enabled: !!businessId,
  });
}

export function useCreateFridge() {
  const queryClient = useQueryClient();
  const { businessId } = useCurrentBusiness();

  return useMutation({
    mutationFn: async (payload: Omit<Fridge, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('fridges')
        .insert({ ...payload, business_id: businessId })
        .select()
        .single();
      
      if (error) throw error;
      return data as Fridge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fridges', businessId] });
    },
  });
}

export function useUpdateFridge() {
  const queryClient = useQueryClient();
  const { businessId } = useCurrentBusiness();

  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Fridge> & { id: string }) => {
      const { data, error } = await supabase
        .from('fridges')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Fridge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fridges', businessId] });
    },
  });
}
