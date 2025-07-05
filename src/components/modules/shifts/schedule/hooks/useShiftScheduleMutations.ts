
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ShiftScheduleData } from '../types';

export const useShiftScheduleMutations = (businessId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create shift mutation
  const createShiftMutation = useMutation({
    mutationFn: async (shiftData: Omit<ShiftScheduleData, 'id' | 'created_at'>) => {
      console.log('🔧 Creating new shift:', shiftData);
      
      const insertData = {
        shift_date: shiftData.shift_date,
        branch_id: shiftData.branch_id || null,
        employee_id: shiftData.employee_id || null,
        is_assigned: !!shiftData.employee_id,
        notes: shiftData.notes || null,
        business_id: businessId,
        shift_template_id: null,
        is_archived: false
      };

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast({
        title: 'הצלחה',
        description: 'המשמרת נוצרה בהצלחה'
      });
    },
    onError: (error) => {
      console.error('💥 Error creating shift:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן ליצור את המשמרת',
        variant: 'destructive'
      });
    }
  });

  // Update shift mutation
  const updateShiftMutation = useMutation({
    mutationFn: async ({ shiftId, updates }: { shiftId: string; updates: Partial<ShiftScheduleData> }) => {
      console.log('🔧 Updating shift:', shiftId, updates);
      
      const updateData: any = {};
      
      if (updates.employee_id !== undefined) {
        updateData.employee_id = updates.employee_id || null;
        updateData.is_assigned = !!updates.employee_id;
      }
      if (updates.shift_date) updateData.shift_date = updates.shift_date;
      if (updates.branch_id) updateData.branch_id = updates.branch_id;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;

      const { error } = await supabase
        .from('scheduled_shifts')
        .update(updateData)
        .eq('id', shiftId);

      if (error) {
        console.error('❌ Error updating shift:', error);
        throw error;
      }

      console.log('✅ Shift updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast({
        title: 'הצלחה',
        description: 'המשמרת עודכנה בהצלחה'
      });
    },
    onError: (error) => {
      console.error('💥 Error updating shift:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את המשמרת',
        variant: 'destructive'
      });
    }
  });

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      console.log('🗑️ Deleting shift:', shiftId);
      
      const { error } = await supabase
        .from('scheduled_shifts')
        .update({ is_archived: true })
        .eq('id', shiftId);

      if (error) {
        console.error('❌ Error archiving shift:', error);
        throw error;
      }

      console.log('✅ Shift archived successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast({
        title: 'הצלחה',
        description: 'המשמרת נמחקה בהצלחה'
      });
    },
    onError: (error) => {
      console.error('💥 Error deleting shift:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את המשמרת',
        variant: 'destructive'
      });
    }
  });

  return {
    createShift: (shiftData: Omit<ShiftScheduleData, 'id' | 'created_at'>) => 
      createShiftMutation.mutate(shiftData),
    updateShift: (shiftId: string, updates: Partial<ShiftScheduleData>) => 
      updateShiftMutation.mutate({ shiftId, updates }),
    deleteShift: (shiftId: string) => deleteShiftMutation.mutate(shiftId)
  };
};
