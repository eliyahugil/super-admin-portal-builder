
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
  statusField?: string;
}

interface BaseEntity {
  id: string;
  [key: string]: any;
}

export const useBusinessData = <T extends BaseEntity = BaseEntity>({
  tableName,
  queryKey,
  filter,
  selectedBusinessId,
  select = '*',
  statusField = 'status',
}: UseBusinessDataOptions): UseQueryResult<T[], Error> => {
  const { businessId: contextBusinessId } = useCurrentBusiness();
  const businessId = selectedBusinessId || contextBusinessId;

  const fetchData = async (): Promise<T[]> => {
    if (!businessId) {
      throw new Error('Business ID is missing');
    }

    // Build query conditions
    let baseQuery = supabase.from(tableName).select(select).eq('business_id', businessId);

    // Apply filter-specific conditions
    let finalQuery;
    switch (filter) {
      case 'active':
        finalQuery = baseQuery.eq('is_archived', false);
        break;
      case 'archived':
        finalQuery = baseQuery.eq('is_archived', true);
        break;
      case 'deleted':
        finalQuery = baseQuery.eq('is_deleted', true);
        break;
      case 'pending':
        finalQuery = baseQuery.eq(statusField, 'pending');
        break;
      default:
        throw new Error(`Unsupported filter: ${filter}`);
    }

    // Add ordering and execute
    const { data, error } = await finalQuery.order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as T[] || [];
  };

  return useQuery<T[], Error>({
    queryKey: [...queryKey, filter, businessId],
    queryFn: fetchData,
    enabled: !!businessId,
    retry: false,
  });
};
