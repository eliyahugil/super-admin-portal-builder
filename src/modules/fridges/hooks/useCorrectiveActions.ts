import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CorrectiveAction } from '@/types/fridges';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export function useCorrectiveActions(fridgeId: string) {
  const { businessId } = useCurrentBusiness();

  return useQuery({
    queryKey: ['corrective-actions', fridgeId, businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corrective_actions')
        .select('*')
        .eq('fridge_id', fridgeId)
        .order('action_time', { ascending: false });
      
      if (error) throw error;
      return (data || []) as CorrectiveAction[];
    },
    enabled: !!fridgeId && !!businessId,
  });
}

export function useAddCorrectiveAction() {
  const queryClient = useQueryClient();
  const { businessId } = useCurrentBusiness();

  return useMutation({
    mutationFn: async (payload: Omit<CorrectiveAction, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('corrective_actions')
        .insert({ ...payload, business_id: businessId })
        .select()
        .single();
      
      if (error) throw error;
      return data as CorrectiveAction;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['corrective-actions', vars.fridge_id] });
    },
  });
}
