
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicShiftSubmission } from '@/types/publicShift';

export const useTokenSubmissions = (tokenId: string) => {
  return useQuery({
    queryKey: ['token-submissions', tokenId],
    queryFn: async (): Promise<PublicShiftSubmission[]> => {
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

      return data || [];
    },
    enabled: !!tokenId,
  });
};
