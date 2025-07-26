
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicShiftForm } from '@/types/publicShift';

export const useShiftSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, formData }: { token: string; formData: PublicShiftForm }) => {
      console.log('🔥 Starting submission mutation with token:', token?.substring(0, 8) + '...');
      
      // Get token details to extract week dates
      const { data: tokenData, error: tokenError } = await supabase
        .from('shift_submission_tokens')
        .select('week_start_date, week_end_date')
        .eq('token', token)
        .single();

      if (tokenError || !tokenData) {
        console.error('❌ Token lookup failed:', tokenError);
        throw new Error(`שגיאה בקבלת פרטי הטוקן: ${tokenError?.message}`);
      }

      // Convert shift preferences to the format expected by the edge function
      const shifts = formData.preferences.map(pref => ({
        date: pref.shift_date || '',
        start_time: pref.start_time,
        end_time: pref.end_time,
        branch_preference: pref.branch_name || '',
        role_preference: pref.role,
        notes: '',
        available_shift_id: pref.shift_id
      }));

      console.log('🔥 Submitting to edge function with:', {
        token: token?.substring(0, 8) + '...',
        shiftsCount: shifts.length,
        weekStart: tokenData.week_start_date,
        weekEnd: tokenData.week_end_date
      });

      // Call the edge function with the token directly
      const { data, error } = await supabase.functions.invoke('submit-weekly-shifts', {
        body: {
          token: token,
          shifts,
          week_start_date: tokenData.week_start_date,
          week_end_date: tokenData.week_end_date,
          notes: formData.notes
        }
      });

      console.log('🔥 Edge function result:', { data, error });

      if (error) {
        console.error('❌ Error submitting shifts via edge function:', error);
        throw new Error(`שגיאה בהגשת המשמרות: ${error.message}`);
      }

      if (!data?.success) {
        console.error('❌ Submission failed:', data?.error);
        throw new Error(data?.error || 'שגיאה בהגשת המשמרות');
      }

      console.log('✅ Submission successful:', data.submission);
      return data.submission;
    },
    onSuccess: (_, { token }) => {
      // Invalidate token submissions using the token to get tokenId
      queryClient.invalidateQueries({ queryKey: ['token-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['public-token', token] });
    },
  });
};
