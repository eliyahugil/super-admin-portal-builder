
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

type AllowedTableNames = 'employees' | 'branches' | 'customers';

interface UseActiveDataOptions {
  tableName: AllowedTableNames;
  queryKey: string[];
  selectedBusinessId?: string | null;
  select?: string;
}

export const useActiveData = <T = any>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*',
}: UseActiveDataOptions): UseQueryResult<T[]> => {
  const { businessId: contextBusinessId } = useCurrentBusiness();
  const businessId = selectedBusinessId || contextBusinessId;

  const fetchData = async (): Promise<T[]> => {
    if (!businessId) return [];

    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .eq('business_id', businessId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data || [];
  };

  return useQuery<T[]>({
    queryKey: [...queryKey, 'active', businessId],
    queryFn: fetchData,
    enabled: !!businessId,
    retry: false,
  });
};
