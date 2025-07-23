
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CreateShiftData, ShiftScheduleData } from '../types';

export const useShiftScheduleMutations = (businessId: string | null) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (shiftData: CreateShiftData) => {
      if (!businessId) throw new Error('Business ID required');
      
      const { data, error } = await supabase
        .from('scheduled_shifts')
        .insert({
          ...shiftData,
          business_id: businessId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-schedule-data'] });
      queryClient.invalidateQueries({ queryKey: ['employee-shifts'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ shiftId, updates }: { shiftId: string; updates: Partial<ShiftScheduleData> }) => {
      const { data, error } = await supabase
        .from('scheduled_shifts')
        .update(updates)
        .eq('id', shiftId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-schedule-data'] });
      queryClient.invalidateQueries({ queryKey: ['employee-shifts'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      const { error } = await supabase
        .from('scheduled_shifts')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-schedule-data'] });
      queryClient.invalidateQueries({ queryKey: ['employee-shifts'] });
    }
  });

  return {
    createShift: async (shiftData: CreateShiftData): Promise<void> => {
      await createMutation.mutateAsync(shiftData);
    },
    updateShift: async (shiftId: string, updates: Partial<ShiftScheduleData>): Promise<void> => {
      await updateMutation.mutateAsync({ shiftId, updates });
    },
    deleteShift: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
