import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CreateShiftData, ShiftScheduleData } from '../types';

export const useOptimizedShiftMutations = (businessId: string | null) => {
  const queryClient = useQueryClient();

  // מיידי - ללא debouncing כדי לקבל עדכונים מיידיים
  const immediateInvalidate = React.useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['shift-schedule-data', businessId],
      refetchType: 'active'
    });
    queryClient.invalidateQueries({ 
      queryKey: ['employee-shifts', businessId],
      refetchType: 'active'
    });
    queryClient.invalidateQueries({ 
      queryKey: ['shifts-table', businessId],
      refetchType: 'active'
    });
  }, [queryClient, businessId]);

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
    onSuccess: () => {
      // רענון מיידי של הנתונים
      immediateInvalidate();
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
      // רענון מיידי של הנתונים
      immediateInvalidate();
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
      // רענון מיידי של הנתונים
      immediateInvalidate();
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