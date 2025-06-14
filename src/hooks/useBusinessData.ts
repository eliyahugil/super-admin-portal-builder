
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
 * The main fix is to:
 * - Inline the fetch function inside the hook (not generic-outside), so TypeScript isn't forced to "pre-resolve" T for too long.
 * - Force-cast with `as unknown as T[]` at the return (safe, since developer controls `select` structure).
 * - Use a non-generic fetch function for better inference.
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

  // Inline fetch function (avoid generic at root scope)
  const fetchData = async (): Promise<T[]> => {
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

    // TypeScript may infer type as GenericStringError[] in some error cases. Cast defensively.
    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Fix for TS2352: first to unknown, then to T[]
    return Array.isArray(data) ? (data as unknown as T[]) : [];
  };

  return useQuery<T[], Error>({
    queryKey: [...queryKey, filter, businessId],
    queryFn: fetchData,
    enabled: !!businessId,
    retry: false,
  });
}
