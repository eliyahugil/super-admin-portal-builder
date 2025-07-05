
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ShiftScheduleData } from '../types';

export const useShiftScheduleMutations = (businessId: string | null) => {
  const queryClient = useQueryClient();

  const createShift = useMutation({
    mutationFn: async (shiftData: Omit<ShiftScheduleData, 'id' | 'created_at' | 'updated_at' | 'business_id' | 'is_assigned' | 'is_archived'>) => {
      console.log('🔄 Creating shift:', shiftData);
      
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const { data, error } = await supabase
        .from('scheduled_shifts')
        .insert({
          business_id: businessId,
          shift_date: shiftData.shift_date,
          employee_id: shiftData.employee_id || null,
          branch_id: shiftData.branch_id || null,
          notes: shiftData.notes || null,
          is_assigned: !!shiftData.employee_id,
          is_archived: false,
          shift_template_id: shiftData.shift_template_id || null
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating shift:', error);
        throw error;
      }

      console.log('✅ Shift created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts', businessId] });
    }
  });

  const updateShift = useMutation({
    mutationFn: async ({ shiftId, updates }: { shiftId: string; updates: Partial<ShiftScheduleData> }) => {
      console.log('🔄 Updating shift:', shiftId, updates);

      const updateData: any = {};
      
      if (updates.employee_id !== undefined) {
        updateData.employee_id = updates.employee_id || null;
        updateData.is_assigned = !!updates.employee_id;
      }
      
      if (updates.branch_id !== undefined) {
        updateData.branch_id = updates.branch_id || null;
      }
      
      if (updates.notes !== undefined) {
        updateData.notes = updates.notes || null;
      }

      if (updates.shift_template_id !== undefined) {
        updateData.shift_template_id = updates.shift_template_id || null;
      }

      const { data, error } = await supabase
        .from('scheduled_shifts')
        .update(updateData)
        .eq('id', shiftId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating shift:', error);
        throw error;
      }

      console.log('✅ Shift updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts', businessId] });
    }
  });

  const deleteShift = useMutation({
    mutationFn: async (shiftId: string) => {
      console.log('🔄 Deleting shift:', shiftId);

      const { error } = await supabase
        .from('scheduled_shifts')
        .delete()
        .eq('id', shiftId);

      if (error) {
        console.error('❌ Error deleting shift:', error);
        throw error;
      }

      console.log('✅ Shift deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts', businessId] });
    }
  });

  return {
    createShift: async (shiftData: Omit<ShiftScheduleData, 'id' | 'created_at' | 'updated_at' | 'business_id' | 'is_assigned' | 'is_archived'>) => {
      await createShift.mutateAsync(shiftData);
    },
    updateShift: async (shiftId: string, updates: Partial<ShiftScheduleData>) => {
      await updateShift.mutateAsync({ shiftId, updates });
    },
    deleteShift: async (shiftId: string) => {
      await deleteShift.mutateAsync(shiftId);
    },
    isCreating: createShift.isPending,
    isUpdating: updateShift.isPending,
    isDeleting: deleteShift.isPending
  };
};
