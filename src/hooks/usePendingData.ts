
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

type AllowedTableNames = 'employee_requests' | 'shift_submissions' | 'customer_agreements';

interface UsePendingDataOptions {
  tableName: AllowedTableNames;
  queryKey: string[];
  selectedBusinessId?: string | null;
  select?: string;
  statusField?: string;
}

export const usePendingData = <T = any>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*',
  statusField = 'status',
}: UsePendingDataOptions): UseQueryResult<T[]> => {
  const { businessId: contextBusinessId } = useCurrentBusiness();
  const businessId = selectedBusinessId || contextBusinessId;

  const fetchData = async (): Promise<T[]> => {
    if (!businessId) return [];

    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .eq('business_id', businessId)
      .eq(statusField, 'pending')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data as T[]) || [];
  };

  return useQuery<T[]>({
    queryKey: [...queryKey, 'pending', businessId],
    queryFn: fetchData,
    enabled: !!businessId,
    retry: false,
  });
};
