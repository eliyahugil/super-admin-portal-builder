
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

// Separate function to build the query - no generics here to simplify TypeScript inference
const buildQuery = (
  tableName: string,
  businessId: string,
  filter: DataFilter,
  select: string,
  statusField: string
) => {
  const baseQuery = supabase
    .from(tableName)
    .select(select)
    .eq('business_id', businessId);

  switch (filter) {
    case 'active':
      return baseQuery.eq('is_archived', false).order('created_at', { ascending: false });
    case 'archived':
      return baseQuery.eq('is_archived', true).order('created_at', { ascending: false });
    case 'deleted':
      return baseQuery.eq('is_deleted', true).order('created_at', { ascending: false });
    case 'pending':
      return baseQuery.eq(statusField, 'pending').order('created_at', { ascending: false });
    default:
      throw new Error(`Unsupported filter: ${filter}`);
  }
};

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

    const query = buildQuery(tableName, businessId, filter, select, statusField);
    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return Array.isArray(data) ? data : [];
  };

  return useQuery<T[], Error>({
    queryKey: [...queryKey, filter, businessId],
    queryFn: fetchData,
    enabled: !!businessId,
    retry: false,
  });
};
