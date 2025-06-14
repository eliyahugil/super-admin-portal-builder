
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

type Result<T> =
  | { success: true; data: T[] }
  | { success: false; error: string };

export const useActiveData = <T = any>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*',
}: UseActiveDataOptions): UseQueryResult<Result<T>> => {
  const { businessId: contextBusinessId } = useCurrentBusiness();
  const businessId = selectedBusinessId || contextBusinessId;

  const fetchActiveData = async (): Promise<Result<T>> => {
    if (!businessId) {
      return { success: false, error: 'לא נמצא מזהה עסק' };
    }

    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .eq('business_id', businessId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`שגיאה בעת טעינת ${tableName}:`, error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  };

  return useQuery<Result<T>>({
    queryKey: [...queryKey, 'active', businessId],
    queryFn: fetchActiveData,
    enabled: !!businessId,
    retry: false,
  });
};
