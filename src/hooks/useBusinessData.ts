
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
 * This hook avoids deep type instantiation by keeping all generics out of fetchers,
 * and applies a single cast with guards at the useQuery level.
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

  // Always fetch unknown[], strictly returning [] on error or non-array
  const fetchData = async (): Promise<unknown[]> => {
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

    // Explicitly handle null and non-array data
    if (!data || !Array.isArray(data)) {
      return [];
    }
    if (data.length > 0 && typeof data[0] === "object" && data[0] && "error" in data[0]) {
      // Defensive: skip errored array
      return [];
    }

    return data;
  };

  return useQuery<T[], Error>({
    queryKey: [...queryKey, filter, businessId],
    queryFn: async () => {
      const res = await fetchData();
      // Defensive at runtime: only take items with an id property
      const filtered = Array.isArray(res)
        ? res.filter((d): d is T => typeof d === "object" && d !== null && "id" in d)
        : [];
      return filtered;
    },
    enabled: !!businessId,
    retry: false,
  });
}
