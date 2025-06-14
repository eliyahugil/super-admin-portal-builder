
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

// רשימת טבלאות מורשות בלבד - עדכן רק אם מוסיפים מודול חדש
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
  [key: string]: unknown;
}

// Type Guard בסיסי עבור BaseEntity (למניעת פירוק טיפוס עמוק)
function isBaseEntity(obj: unknown): obj is BaseEntity {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as { id: unknown }).id === 'string'
  );
}

/**
 * Hook אוניברסלי לשליפת נתוני מודול עסקי בצורה בטוחה ושטוחה.
 * Returns data: T[] רק עבור רשומות שיש להן id, אחרת [].
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

  // הפונקציה תמיד מחזירה unknown[] ואחרי־כן מסננת ואופה
  const fetchData = async (): Promise<T[]> => {
    if (!businessId) throw new Error('Business ID is missing');
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

    if (error) throw new Error(error.message);

    // convert to array only if possible
    const arr: unknown[] = Array.isArray(data) ? data : [];

    // מסנן ידנית הרשומות עם id בלבד
    const filtered: T[] = arr.filter(isBaseEntity) as T[];
    return filtered;
  };

  // מניעת טיפוס עמוק ושגיאת TypeScript – עושים cast ידני אחרי השליפה
  return useQuery<T[], Error>({
    queryKey: [...queryKey, filter, businessId],
    queryFn: fetchData,
    enabled: !!businessId,
    retry: false,
  });
}
