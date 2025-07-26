
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
}

export const useTokenSubmissions = (tokenId: string) => {
  return useQuery({
    queryKey: ['token-submissions', tokenId],
    queryFn: async (): Promise<ShiftSubmission[]> => {
      if (!tokenId) return [];
      
      const { data, error } = await supabase
        .from('shift_submissions')
        .select('*')
        .eq('token_id', tokenId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        return [];
      }

      return (data || []) as ShiftSubmission[];
    },
    enabled: !!tokenId,
  });
};
