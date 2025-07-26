
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ShiftSubmission {
  id: string;
  employee_id: string;
  shifts: any;
  notes: string | null;
  status: string;
  submission_type: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  week_start_date: string;
  week_end_date: string;
  optional_morning_availability?: number[];
}

export const useTokenSubmissions = (tokenId: string) => {
  return useQuery({
    queryKey: ['token-submissions', tokenId],
    queryFn: async (): Promise<ShiftSubmission[]> => {
      if (!tokenId) return [];
      
      // First, get the token details to find submissions by week dates
      const { data: tokenData, error: tokenError } = await supabase
        .from('shift_submission_tokens')
        .select('week_start_date, week_end_date, business_id')
        .eq('id', tokenId)
        .maybeSingle();

      if (tokenError) {
        console.error('Error fetching token:', tokenError);
        return [];
      }

      if (!tokenData) {
        console.error('Token not found');
        return [];
      }

      // Now get submissions for the same week and business
      const { data, error } = await supabase
        .from('shift_submissions')
        .select(`
          id,
          employee_id,
          shifts,
          notes,
          status,
          submission_type,
          submitted_at,
          created_at,
          updated_at,
          week_start_date,
          week_end_date,
          optional_morning_availability
        `)
        .eq('week_start_date', tokenData.week_start_date)
        .eq('week_end_date', tokenData.week_end_date)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!tokenId,
  });
};
