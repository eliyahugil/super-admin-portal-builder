
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

type AllowedTableNames = 'employees' | 'branches' | 'customers';

interface UseArchivedDataOptions {
  tableName: AllowedTableNames;
  queryKey: string[];
  selectedBusinessId?: string | null;
  select?: string;
}

type Result<T> =
  | { success: true; data: T[] }
  | { success: false; error: string };

export const useArchivedData = <T = any>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*',
}: UseArchivedDataOptions): UseQueryResult<Result<T>> => {
  const { businessId: contextBusinessId } = useCurrentBusiness();
  const businessId = selectedBusinessId || contextBusinessId;

  const fetchArchivedData = async (): Promise<Result<T>> => {
    if (!businessId) {
      return { success: false, error: 'לא נמצא מזהה עסק' };
    }

    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .eq('business_id', businessId)
      .eq('is_archived', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`שגיאה בעת טעינת ${tableName} מהארכיון:`, error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  };

  return useQuery<Result<T>>({
    queryKey: [...queryKey, 'archived', businessId],
    queryFn: fetchArchivedData,
    enabled: !!businessId,
    retry: false,
    onError: (err) => {
      console.error(`שגיאה בלתי צפויה בעת קריאה ל-${tableName}:`, err);
    },
  });
};
