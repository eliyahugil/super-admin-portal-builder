
import { useQuery, QueryKey } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from './useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';

interface UseSecureBusinessDataOptions {
  queryKey: QueryKey;
  tableName: string;
  filters?: Record<string, any>;
  enabled?: boolean;
  select?: string;
  orderBy?: { column: string; ascending: boolean };
}

/**
 * Secure hook for fetching business data with automatic business_id filtering
 * Enforces data isolation between businesses unless user is super admin
 */
export function useSecureBusinessData<T = any>({ 
  queryKey, 
  tableName, 
  filters = {}, 
  enabled = true,
  select = '*',
  orderBy
}: UseSecureBusinessDataOptions) {
  const { profile } = useAuth();
  const { businessId, isSuperAdmin } = useCurrentBusiness();

  return useQuery({
    queryKey: [...queryKey, businessId],
    queryFn: async (): Promise<T[]> => {
      console.log(`useSecureBusinessData - Fetching from ${tableName}`, { 
        filters, 
        businessId, 
        isSuperAdmin,
        userProfile: profile?.email
      });
      
      let query = supabase.from(tableName as any).select(select);
      
      // Apply user-provided filters first
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
          console.log(`useSecureBusinessData - Applied filter: ${key} = ${value}`);
        }
      });
      
      // Automatically enforce business filtering for non-super-admins
      // Super admins can see all data, regular users only see their business data
      if (!isSuperAdmin && businessId) {
        // Only apply business_id filter if the table is business-specific
        // Skip for global tables like modules_config, supported_integrations
        const globalTables = ['modules_config', 'supported_integrations', 'profiles'];
        if (!globalTables.includes(tableName)) {
          console.log(`useSecureBusinessData - Adding business security filter: ${businessId}`);
          query = query.eq('business_id', businessId);
        }
      }

      // Apply ordering if specified
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending });
        console.log(`useSecureBusinessData - Applied ordering: ${orderBy.column} ${orderBy.ascending ? 'ASC' : 'DESC'}`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`useSecureBusinessData - Error fetching ${tableName}:`, error);
        throw error;
      }
      
      console.log(`useSecureBusinessData - Successfully fetched ${data?.length || 0} records from ${tableName}`);
      return (data as T[]) || [];
    },
    enabled: enabled && !!profile && (!businessId || isSuperAdmin || !!businessId),
  });
}
