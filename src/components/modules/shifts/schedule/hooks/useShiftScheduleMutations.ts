
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ShiftScheduleData, CreateShiftData } from '../types';

export const useShiftScheduleMutations = (businessId: string | null) => {
  const queryClient = useQueryClient();

  const createShift = useMutation({
    mutationFn: async (shiftData: CreateShiftData) => {
      console.log('🔄 Creating shift with business ID:', businessId);
      console.log('🔄 Shift data:', shiftData);
      
      if (!businessId) {
        console.error('❌ No business ID provided');
        throw new Error('Business ID is required');
      }

      const insertData = {
        business_id: businessId,
        shift_date: shiftData.shift_date,
        start_time: shiftData.start_time,
        end_time: shiftData.end_time,
        employee_id: shiftData.employee_id,
        branch_id: shiftData.branch_id,
        role: shiftData.role,
        notes: shiftData.notes,
        status: shiftData.status || (shiftData.employee_id ? 'approved' : 'pending'),
        is_assigned: !!shiftData.employee_id,
        is_archived: false,
        shift_template_id: shiftData.shift_template_id
      };

      console.log('🔄 Insert data:', insertData);

      const { data, error } = await supabase
        .from('scheduled_shifts')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating shift:', error);
        throw error;
      }

      console.log('✅ Shift created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Mutation success callback:', data);
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts', businessId] });
    },
    onError: (error) => {
      console.error('❌ Mutation error callback:', error);
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

      if (updates.role !== undefined) {
        updateData.role = updates.role || null;
      }

      if (updates.start_time !== undefined) {
        updateData.start_time = updates.start_time;
      }

      if (updates.end_time !== undefined) {
        updateData.end_time = updates.end_time;
      }

      if (updates.status !== undefined) {
        updateData.status = updates.status;
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
    createShift: async (shiftData: CreateShiftData) => {
      console.log('🚀 Starting shift creation process...');
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
