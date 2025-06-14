
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

type AllowedTableNames = 'employees' | 'branches' | 'customers';

interface UseArchivedDataOptions {
  tableName: AllowedTableNames;
  queryKey: string[];
  selectedBusinessId?: string | null;
  select?: string;
}

export const useArchivedData = <T = any>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*'
}: UseArchivedDataOptions): UseQueryResult<T[]> => {
  const { businessId: contextBusinessId } = useCurrentBusiness();
  const businessId = selectedBusinessId || contextBusinessId;

  return useQuery<T[]>({
    queryKey: [...queryKey, 'archived', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      let query = supabase
        .from(tableName)
        .select(select)
        .eq('business_id', businessId)
        .eq('is_archived', true)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching archived ${tableName}:`, error);
        throw error;
      }

      // Return the data as unknown first, then cast to array
      const safeData = Array.isArray(data) ? data : [];
      return safeData as T[];
    },
    enabled: !!businessId,
  });
};
