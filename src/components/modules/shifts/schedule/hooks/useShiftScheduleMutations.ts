
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import type { ShiftScheduleData, CreateShiftData } from '../types';

export const useShiftScheduleMutations = (businessId: string | null) => {
  const queryClient = useQueryClient();
  const { logActivity } = useActivityLogger();

  // Check for duplicate shifts before creation
  const checkForDuplicates = async (shiftData: CreateShiftData) => {
    const { data: existingShifts, error } = await supabase
      .from('scheduled_shifts')
      .select('id, shift_date, start_time, end_time, employee_id, branch_id')
      .eq('business_id', businessId)
      .eq('shift_date', shiftData.shift_date)
      .eq('start_time', shiftData.start_time)
      .eq('end_time', shiftData.end_time);

    if (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }

    // Check for exact duplicates
    const exactDuplicates = existingShifts?.filter(shift => 
      shift.employee_id === shiftData.employee_id &&
      shift.branch_id === shiftData.branch_id
    );

    return exactDuplicates && exactDuplicates.length > 0;
  };

  const createShift = useMutation({
    mutationFn: async (shiftData: CreateShiftData) => {
      console.log('🔄 Creating shift with business ID:', businessId);
      console.log('🔄 Shift data:', shiftData);
      
      if (!businessId) {
        console.error('❌ No business ID provided');
        throw new Error('Business ID is required');
      }

      // Check for duplicates
      const isDuplicate = await checkForDuplicates(shiftData);
      if (isDuplicate) {
        const errorMsg = `Duplicate shift detected for ${shiftData.shift_date} ${shiftData.start_time}-${shiftData.end_time}`;
        console.warn('⚠️', errorMsg);
        
        // Log the duplicate attempt
        await logActivity({
          action: 'duplicate_shift_prevented',
          target_type: 'shift',
          target_id: 'duplicate_prevention',
          details: {
            shift_date: shiftData.shift_date,
            start_time: shiftData.start_time,
            end_time: shiftData.end_time,
            employee_id: shiftData.employee_id,
            branch_id: shiftData.branch_id,
            prevented_at: new Date().toISOString()
          }
        });
        
        throw new Error('משמרת זהה כבר קיימת עבור התאריך והשעות הנבחרים');
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
        required_employees: shiftData.required_employees || 1,
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
      
      // Log the successful creation with detailed information
      await logActivity({
        action: 'shift_created',
        target_type: 'shift',
        target_id: data.id,
        details: {
          shift_date: data.shift_date,
          start_time: data.start_time,
          end_time: data.end_time,
          employee_id: data.employee_id,
          branch_id: data.branch_id,
          role: data.role,
          status: data.status,
          is_assigned: data.is_assigned,
          business_id: businessId,
          created_at: new Date().toISOString(),
          creation_method: 'form_submission'
        }
      });
      
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

      if (updates.required_employees !== undefined) {
        updateData.required_employees = updates.required_employees || 1;
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

      // Get shift details before deletion for logging
      const { data: shiftDetails } = await supabase
        .from('scheduled_shifts')
        .select('*')
        .eq('id', shiftId)
        .single();

      const { error } = await supabase
        .from('scheduled_shifts')
        .delete()
        .eq('id', shiftId);

      if (error) {
        console.error('❌ Error deleting shift:', error);
        throw error;
      }

      console.log('✅ Shift deleted successfully');

      // Log the deletion
      if (shiftDetails) {
        await logActivity({
          action: 'shift_deleted',
          target_type: 'shift',
          target_id: shiftId,
          details: {
            deleted_shift: shiftDetails,
            deleted_at: new Date().toISOString(),
            deletion_method: 'user_action'
          }
        });
      }
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
