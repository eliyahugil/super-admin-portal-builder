
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

/**
 * TS Deep Instantiation Fix:
 * - Remove all generics from fetchData, always operate on BaseEntity[] internally.
 * - Only provide the T generic at the useQuery level.
 * - Cast the returned array to T[] as the final step.
 */
export function useBusinessData<T extends BaseEntity = BaseEntity>(
  options: UseBusinessDataOptions
): UseQueryResult<T[], Error> {
  const {
    tableName,
    queryKey,
    filter,
    selectedBusinessId,
    select = '*',
    statusField = 'status',
  } = options;

  const { businessId: contextBusinessId } = useCurrentBusiness();
  const businessId = selectedBusinessId || contextBusinessId;

  // NOT generic fetch - always returns BaseEntity[]
  const fetchData = async (): Promise<BaseEntity[]> => {
    if (!businessId) {
      throw new Error('Business ID is missing');
    }

    let query = supabase
      .from(tableName)
      .select(select)
      .eq('business_id', businessId);

    switch (filter) {
      case 'active':
        query = query.eq('is_archived', false).order('created_at', { ascending: false });
        break;
      case 'archived':
        query = query.eq('is_archived', true).order('created_at', { ascending: false });
        break;
      case 'deleted':
        query = query.eq('is_deleted', true).order('created_at', { ascending: false });
        break;
      case 'pending':
        query = query.eq(statusField, 'pending').order('created_at', { ascending: false });
        break;
      default:
        throw new Error(`Unsupported filter: ${filter}`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return Array.isArray(data) ? data as BaseEntity[] : [];
  };

  // Only generic here (no deep generic chaining)
  return useQuery<T[], Error>({
    queryKey: [...queryKey, filter, businessId],
    queryFn: async () => {
      const res = await fetchData();
      return res as T[];
    },
    enabled: !!businessId,
    retry: false,
  });
}
