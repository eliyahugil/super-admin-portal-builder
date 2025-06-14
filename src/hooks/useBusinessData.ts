
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

type AllowedTableNames = 'employees' | 'branches' | 'customers';
type DataFilter = 'active' | 'archived' | 'deleted' | 'pending';

interface UseBusinessDataOptions {
  tableName: AllowedTableNames;
  queryKey: string[];
  filter: DataFilter;
  selectedBusinessId?: string | null;
  select?: string;
  statusField?: string; // For pending filter - defaults to 'status'
}

export const useBusinessData = <T = any>({
  tableName,
  queryKey,
  filter,
  selectedBusinessId,
  select = '*',
  statusField = 'status',
}: UseBusinessDataOptions): UseQueryResult<T[]> => {
  const { businessId: contextBusinessId } = useCurrentBusiness();
  const businessId = selectedBusinessId || contextBusinessId;

  const fetchData = async (): Promise<T[]> => {
    if (!businessId) {
      throw new Error('Business ID is missing');
    }

    let query = supabase
      .from(tableName)
      .select(select)
      .eq('business_id', businessId);

    // Apply filter-specific conditions
    switch (filter) {
      case 'active':
        query = query.eq('is_archived', false);
        break;
      case 'archived':
        query = query.eq('is_archived', true);
        break;
      case 'deleted':
        query = query.eq('is_deleted', true);
        break;
      case 'pending':
        query = query.eq(statusField, 'pending');
        break;
      default:
        throw new Error(`Unsupported filter: ${filter}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return Array.isArray(data) ? data : [];
  };

  return useQuery<T[]>({
    queryKey: [...queryKey, filter, businessId],
    queryFn: fetchData,
    enabled: !!businessId,
    retry: false,
  });
};
