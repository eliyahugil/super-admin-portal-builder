
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

/**
 * Hook אוניברסלי לשליפת נתוני מודול עסקי בצורה בטוחה ושטוחה.
 * מבטיח הפרדת נתונים בין עסקים
 */
export function useBusinessData<T = any>(
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

  const { businessId: contextBusinessId, isSuperAdmin } = useCurrentBusiness();
  const businessId = selectedBusinessId || contextBusinessId;

  const fetchData = async (): Promise<T[]> => {
    console.log(`🔒 useBusinessData - Security check for ${tableName}:`, {
      businessId,
      filter,
      isSuperAdmin,
      selectedBusinessId
    });

    // CRITICAL: Business ID is required for non-super admins
    if (!businessId && !isSuperAdmin) {
      console.error('❌ SECURITY: No business ID available for regular user');
      throw new Error('Business ID is required for data access');
    }

    // Start with base query - using any to avoid complex type inference
    let query: any = supabase.from(tableName).select(select);

    // Add business filter - CRITICAL for security
    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    // Apply status filters based on filter type
    if (filter === 'active') {
      query = query.eq('is_archived', false);
    } else if (filter === 'archived') {
      query = query.eq('is_archived', true);
    } else if (filter === 'deleted') {
      query = query.eq('is_deleted', true);
    } else if (filter === 'pending') {
      query = query.eq(statusField, 'pending');
    } else {
      throw new Error(`Unsupported filter: ${filter}`);
    }

    // Add ordering
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error(`❌ Database error for ${tableName}:`, error);
      throw new Error(error.message);
    }

    console.log(`✅ Security check passed - fetched ${data?.length || 0} records for business ${businessId}`);

    // Return only valid records with proper business_id
    if (!data) {
      return [];
    }

    // Double-check business isolation for security
    const validRecords = data.filter((record: any) => {
      if (!record || typeof record !== 'object' || !record.id) {
        return false;
      }
      // Critical security check: ensure record belongs to correct business
      if (businessId && record.business_id !== businessId) {
        console.error('⚠️ SECURITY BREACH: Record with wrong business_id detected!', {
          recordBusinessId: record.business_id,
          expectedBusinessId: businessId,
          recordId: record.id
        });
        return false;
      }
      return true;
    });

    return validRecords as T[];
  };

  return useQuery<T[], Error>({
    queryKey: [...queryKey, filter, businessId],
    queryFn: fetchData,
    enabled: !!businessId || isSuperAdmin,
    retry: false,
  });
}
