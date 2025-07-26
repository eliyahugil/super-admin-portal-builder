
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEmployeeCompatibleShifts = (token: string) => {
  return useQuery({
    queryKey: ['employee-compatible-shifts', token],
    queryFn: async () => {
      if (!token) return null;
      
      const { data, error } = await supabase.functions.invoke('get-employee-compatible-shifts', {
        body: { token }
      });

      if (error) {
        console.error('Error fetching compatible shifts:', error);
        throw new Error('שגיאה בטעינת משמרות תואמות');
      }

      return data;
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
