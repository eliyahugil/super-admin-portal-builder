
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicShiftToken } from '@/types/publicShift';

export const useTokenDetails = (token: string) => {
  return useQuery({
    queryKey: ['public-token', token],
    queryFn: async (): Promise<PublicShiftToken | null> => {
      if (!token) return null;
      
      const { data, error } = await supabase
        .from('shift_submission_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) {
        console.error('Error fetching token:', error);
        throw new Error('טוקן לא נמצא או שפג תוקפו');
      }

      return data;
    },
    enabled: !!token,
  });
};
