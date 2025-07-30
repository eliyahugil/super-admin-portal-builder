
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from '@/utils/performance';
import type { CreateShiftData, ShiftScheduleData } from '../types';

export const useOptimizedShiftMutations = (businessId: string | null) => {
  const queryClient = useQueryClient();

  // Debounced invalidation to prevent excessive refetches
  const debouncedInvalidate = debounce(() => {
    queryClient.invalidateQueries({ queryKey: ['shift-schedule-data'] });
    queryClient.invalidateQueries({ queryKey: ['employee-shifts'] });
  }, 300);

  // Helper function to convert ShiftAssignment[] to JSON for database
  const convertShiftAssignmentsForDB = (assignments?: any): any => {
    if (!assignments || !Array.isArray(assignments)) return null;
    
    return assignments.map(assignment => ({
      id: assignment.id || '',
      type: assignment.type || 'חובה',
      employee_id: assignment.employee_id || null,
      position: assignment.position || 1,
      is_required: assignment.is_required || false
    }));
  };

  const createMutation = useMutation({
    mutationFn: async (shiftData: CreateShiftData) => {
      if (!businessId) throw new Error('Business ID required');
      
      const dbData = {
        ...shiftData,
        business_id: businessId,
        shift_assignments: convertShiftAssignmentsForDB(shiftData.shift_assignments)
      };

      const { data, error } = await supabase
        .from('scheduled_shifts')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newShift) => {
      console.log('✅ SHIFT CREATED SUCCESSFULLY! Force refreshing everything:', newShift);
      
      // **CRITICAL FIX:** Multiple aggressive cache invalidations
      queryClient.invalidateQueries({ queryKey: ['shift-schedule-data'] });
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ 
        queryKey: ['shift-schedule-data', businessId],
        type: 'active'
      });
      
      // Additional delayed refetch to make sure
      setTimeout(() => {
        console.log('🔄 DELAYED REFETCH for shifts');
        queryClient.invalidateQueries({ queryKey: ['shift-schedule-data'] });
        queryClient.refetchQueries({ queryKey: ['shift-schedule-data', businessId] });
      }, 1500);
      
      debouncedInvalidate();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ shiftId, updates }: { shiftId: string; updates: Partial<ShiftScheduleData> }) => {
      console.log('🔄 useOptimizedShiftMutations updateMutation - Starting update:', { shiftId, updates });
      
      const dbUpdates = {
        ...updates,
        shift_assignments: updates.shift_assignments ? convertShiftAssignmentsForDB(updates.shift_assignments) : undefined
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });

      const { data, error } = await supabase
        .from('scheduled_shifts')
        .update(dbUpdates)
        .eq('id', shiftId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      debouncedInvalidate();
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
      debouncedInvalidate();
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
