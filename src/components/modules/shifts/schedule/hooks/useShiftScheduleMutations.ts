
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CreateShiftData, ShiftScheduleData } from '../types';

export const useShiftScheduleMutations = (businessId: string | null) => {
  const queryClient = useQueryClient();

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
      
      // Convert shift assignments to proper JSON format
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
    onSuccess: () => {
      // רענון מיידי וחד ממדי של הנתונים
      queryClient.invalidateQueries({ 
        queryKey: ['shift-schedule-data'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['employee-shifts'],
        refetchType: 'active' 
      });
      
      // רענון כללי של כל ה-cache הקשור למשמרות
      queryClient.invalidateQueries({ 
        queryKey: ['shifts-table'],
        refetchType: 'active'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ shiftId, updates }: { shiftId: string; updates: Partial<ShiftScheduleData> }) => {
      console.log('🔄 updateMutation - Starting update:', { shiftId, updates });
      
      // Convert shift assignments to proper JSON format for updates
      const dbUpdates = {
        ...updates,
        shift_assignments: updates.shift_assignments ? convertShiftAssignmentsForDB(updates.shift_assignments) : undefined
      };

      // Remove undefined values to prevent Supabase errors
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });

      console.log('📤 updateMutation - Sending to DB:', { shiftId, dbUpdates });

      const { data, error } = await supabase
        .from('scheduled_shifts')
        .update(dbUpdates)
        .eq('id', shiftId)
        .select()
        .single();

      if (error) {
        console.error('❌ updateMutation - Error:', error);
        throw error;
      }
      
      console.log('✅ updateMutation - Success:', data);
      return data;
    },
    onSuccess: () => {
      // רענון מיידי וחד ממדי של הנתונים
      queryClient.invalidateQueries({ 
        queryKey: ['shift-schedule-data'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['employee-shifts'],
        refetchType: 'active' 
      });
      
      // רענון כללי של כל ה-cache הקשור למשמרות
      queryClient.invalidateQueries({ 
        queryKey: ['shifts-table'],
        refetchType: 'active'
      });
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
      // רענון מיידי וחד ממדי של הנתונים
      queryClient.invalidateQueries({ 
        queryKey: ['shift-schedule-data'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['employee-shifts'],
        refetchType: 'active' 
      });
      
      // רענון כללי של כל ה-cache הקשור למשמרות
      queryClient.invalidateQueries({ 
        queryKey: ['shifts-table'],
        refetchType: 'active'
      });
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
