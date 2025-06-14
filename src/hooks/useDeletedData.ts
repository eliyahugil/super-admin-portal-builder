
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

type AllowedTableNames = 'employees' | 'branches' | 'customers';

interface UseDeletedDataOptions {
  tableName: AllowedTableNames;
  queryKey: string[];
  selectedBusinessId?: string | null;
  select?: string;
}

export const useDeletedData = <T = any>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*',
}: UseDeletedDataOptions): UseQueryResult<T[]> => {
  const { businessId: contextBusinessId } = useCurrentBusiness();
  const businessId = selectedBusinessId || contextBusinessId;

  const fetchData = async (): Promise<T[]> => {
    if (!businessId) {
      throw new Error('Business ID is missing');
    }

    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .eq('business_id', businessId)
      .eq('is_deleted', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return Array.isArray(data) ? data : [];
  };

  return useQuery<T[]>({
    queryKey: [...queryKey, 'deleted', businessId],
    queryFn: fetchData,
    enabled: !!businessId,
    retry: false,
  });
};
