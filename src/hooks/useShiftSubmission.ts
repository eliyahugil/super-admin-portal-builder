
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ShiftSubmissionData {
  token: string;
  employeeId: string;
  weekStart: string;
  weekEnd: string;
  shifts: Array<{
    shift_id: string;
    date: string;
    start_time: string;
    end_time: string;
    branch_preference: string;
    role_preference: string;
    available: boolean;
  }>;
  notes?: string;
}

export const useShiftSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ShiftSubmissionData) => {
      const { data: result, error } = await supabase
        .from('shift_submissions')
        .insert({
          employee_id: data.employeeId,
          week_start_date: data.weekStart,
          week_end_date: data.weekEnd,
          shifts: JSON.stringify(data.shifts),
          notes: data.notes || null,
          status: 'pending',
          submission_type: 'public_token'
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting shifts:', error);
        throw new Error('שגיאה בהגשת המשמרות');
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['employee-compatible-shifts', variables.token] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['token-submissions'] 
      });
    },
  });
};
