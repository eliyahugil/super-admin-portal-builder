import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FridgeAlert } from '@/types/fridges';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export function useFridgeAlerts(fridgeId?: string, status?: 'פתוחה' | 'סגורה') {
  const { businessId } = useCurrentBusiness();

  return useQuery({
    queryKey: ['fridge-alerts', fridgeId, status, businessId],
    queryFn: async () => {
      let query = supabase
        .from('fridge_alerts')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(200);

      if (fridgeId) query = query.eq('fridge_id', fridgeId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as FridgeAlert[];
    },
    enabled: !!businessId,
  });
}

export function useCloseAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('fridge_alerts')
        .update({ status: 'סגורה', resolved_at: new Date().toISOString() })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      return data as FridgeAlert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fridge-alerts'] });
    },
  });
}
