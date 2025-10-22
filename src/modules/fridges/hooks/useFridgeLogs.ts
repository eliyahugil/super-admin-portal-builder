import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FridgeTemperatureLog } from '@/types/fridges';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface UseLogsOptions {
  from?: string;
  to?: string;
  limit?: number;
}

export function useFridgeLogs(fridgeId: string, options?: UseLogsOptions) {
  const { businessId } = useCurrentBusiness();

  return useQuery({
    queryKey: ['fridge-logs', fridgeId, options],
    queryFn: async () => {
      let query = supabase
        .from('fridge_temperature_logs')
        .select('*')
        .eq('fridge_id', fridgeId)
        .order('measured_at', { ascending: false })
        .limit(options?.limit ?? 500);

      if (options?.from) query = query.gte('measured_at', options.from);
      if (options?.to) query = query.lte('measured_at', options.to);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as FridgeTemperatureLog[];
    },
    enabled: !!fridgeId && !!businessId,
  });
}

export function useAddFridgeLog() {
  const queryClient = useQueryClient();
  const { businessId } = useCurrentBusiness();

  return useMutation({
    mutationFn: async (payload: Omit<FridgeTemperatureLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('fridge_temperature_logs')
        .insert({ ...payload, business_id: businessId })
        .select()
        .single();
      
      if (error) throw error;
      return data as FridgeTemperatureLog;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['fridge-logs', vars.fridge_id] });
      queryClient.invalidateQueries({ queryKey: ['fridge-alerts'] });
    },
  });
}
