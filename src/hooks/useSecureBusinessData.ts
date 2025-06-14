
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface UseSecureBusinessDataOptions {
  queryKey: string[];
  tableName: string;
  filter?: Record<string, any>;
  orderBy?: { column: string; ascending: boolean };
  select?: string;
  enabled?: boolean;
}

/**
 * Hook מאובטח לשליפת נתוני עסק עם RLS policies
 * תומך בפילטרים ומיון מתקדמים
 */
export function useSecureBusinessData<T = any>(
  options: UseSecureBusinessDataOptions
): UseQueryResult<T[], Error> {
  const {
    queryKey,
    tableName,
    filter = {},
    orderBy,
    select = '*',
    enabled = true
  } = options;

  const { businessId, isSuperAdmin } = useCurrentBusiness();

  const fetchData = async (): Promise<T[]> => {
    console.log(`🔒 useSecureBusinessData - Fetching ${tableName}:`, {
      businessId,
      filter,
      orderBy,
      isSuperAdmin
    });

    // Start with base query
    let query = supabase.from(tableName).select(select);

    // Apply filters
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply ordering if specified
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending });
    } else {
      // Default ordering by created_at if available
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error(`❌ Database error for ${tableName}:`, error);
      throw new Error(error.message);
    }

    console.log(`✅ Fetched ${data?.length || 0} records from ${tableName}`);
    return (data || []) as T[];
  };

  return useQuery<T[], Error>({
    queryKey: [...queryKey, businessId, filter, orderBy],
    queryFn: fetchData,
    enabled: enabled && (!!businessId || isSuperAdmin),
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
