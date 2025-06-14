
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

    // Always fetch as unknown[], cast at the end
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

    // Use type: { data: unknown[] | null; error: any }
    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Cast only at this point
    return Array.isArray(data) ? (data as T[]) : [];
  };

  // Explicitly type the result to <T[]>
  return useQuery<T[], Error>({
    queryKey: [...queryKey, filter, businessId],
    queryFn: fetchData,
    enabled: !!businessId,
    retry: false,
  });
};
