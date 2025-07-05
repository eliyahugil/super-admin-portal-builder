
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ShiftScheduleData } from '../types';

export const useShiftScheduleMutations = (businessId: string | null) => {
  const queryClient = useQueryClient();

  const createShiftMutation = useMutation({
    mutationFn: async (shiftData: Omit<ShiftScheduleData, 'id' | 'created_at'>) => {
      console.log('🔄 Creating shift with data:', shiftData);
      
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      // Verify the branch belongs to the current business
      if (shiftData.branch_id) {
        const { data: branch, error: branchError } = await supabase
          .from('branches')
          .select('business_id')
          .eq('id', shiftData.branch_id)
          .eq('business_id', businessId)
          .single();

        if (branchError || !branch) {
          throw new Error('הסניף שנבחר לא שייך לעסק הזה');
        }
      }

      // Create scheduled shift
      const { data, error } = await supabase
        .from('scheduled_shifts')
        .insert({
          shift_date: shiftData.shift_date,
          branch_id: shiftData.branch_id || null,
          employee_id: shiftData.employee_id || null,
          notes: shiftData.notes || null,
          is_assigned: !!shiftData.employee_id,
          business_id: businessId
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
      toast.success('המשמרת נוצרה בהצלחה');
    },
    onError: (error: any) => {
      console.error('❌ Create shift error:', error);
      toast.error(error.message || 'שגיאה ביצירת המשמרת');
    }
  });

  const updateShiftMutation = useMutation({
    mutationFn: async ({ shiftId, updates }: { shiftId: string; updates: Partial<ShiftScheduleData> }) => {
      console.log('🔄 Updating shift:', shiftId, updates);
      
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      // Verify shift belongs to current business
      const { data: existingShift, error: checkError } = await supabase
        .from('scheduled_shifts')
        .select('business_id')
        .eq('id', shiftId)
        .eq('business_id', businessId)
        .single();

      if (checkError || !existingShift) {
        throw new Error('המשמרת לא נמצאה או לא שייכת לעסק');
      }

      // If updating branch, verify it belongs to the business
      if (updates.branch_id) {
        const { data: branch, error: branchError } = await supabase
          .from('branches')
          .select('business_id')
          .eq('id', updates.branch_id)
          .eq('business_id', businessId)
          .single();

        if (branchError || !branch) {
          throw new Error('הסניף שנבחר לא שייך לעסק הזה');
        }
      }

      const { data, error } = await supabase
        .from('scheduled_shifts')
        .update({
          ...(updates.shift_date && { shift_date: updates.shift_date }),
          ...(updates.branch_id !== undefined && { branch_id: updates.branch_id }),
          ...(updates.employee_id !== undefined && { 
            employee_id: updates.employee_id || null,
            is_assigned: !!updates.employee_id
          }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
        })
        .eq('id', shiftId)
        .eq('business_id', businessId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating shift:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts', businessId] });
      toast.success('המשמרת עודכנה בהצלחה');
    },
    onError: (error: any) => {
      console.error('❌ Update shift error:', error);
      toast.error(error.message || 'שגיאה בעדכון המשמרת');
    }
  });

  const deleteShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      console.log('🔄 Deleting shift:', shiftId);
      
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const { error } = await supabase
        .from('scheduled_shifts')
        .delete()
        .eq('id', shiftId)
        .eq('business_id', businessId);

      if (error) {
        console.error('❌ Error deleting shift:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts', businessId] });
      toast.success('המשמרת נמחקה בהצלחה');
    },
    onError: (error: any) => {
      console.error('❌ Delete shift error:', error);
      toast.error(error.message || 'שגיאה במחיקת המשמרת');
    }
  });

  return {
    createShift: createShiftMutation.mutate,
    updateShift: (shiftId: string, updates: Partial<ShiftScheduleData>) => 
      updateShiftMutation.mutate({ shiftId, updates }),
    deleteShift: deleteShiftMutation.mutate,
    isCreating: createShiftMutation.isPending,
    isUpdating: updateShiftMutation.isPending,
    isDeleting: deleteShiftMutation.isPending
  };
};
