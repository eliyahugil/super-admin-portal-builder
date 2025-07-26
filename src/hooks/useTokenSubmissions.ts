
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ShiftSubmission {
  id: string;
  token_id: string;
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
    queryFn: async () => {
      if (!tokenId) return [];
      
      const { data, error } = await supabase
        .from('shift_submissions')
        .select(`
          id,
          token_id,
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
        .eq('token_id', tokenId)
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
