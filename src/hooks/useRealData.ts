
import { useQuery, QueryKey } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from './useCurrentBusiness';

interface UseRealDataOptions {
  queryKey: QueryKey;
  tableName: string;
  filters?: Record<string, any>;
  enabled?: boolean;
  enforceBusinessFilter?: boolean;
  select?: string;
  orderBy?: { column: string; ascending: boolean };
}

/**
 * UPDATED: Enhanced useRealData with mandatory business isolation
 * This ensures all data queries respect business boundaries and RLS policies
 */
export function useRealData<T = any>({ 
  queryKey, 
  tableName, 
  filters = {}, 
  enabled = true,
  enforceBusinessFilter = true,
  select = '*',
  orderBy
}: UseRealDataOptions) {
  const { profile } = useAuth();
  const { businessId, isSuperAdmin } = useCurrentBusiness();

  return useQuery({
    queryKey: [...queryKey, businessId], // Include businessId in query key for proper caching
    queryFn: async (): Promise<T[]> => {
      console.log(`useRealData - Fetching from ${tableName} with business security`, { 
        filters, 
        businessId, 
        isSuperAdmin,
        enforceBusinessFilter,
        userProfile: profile?.email
      });
      
      let query = supabase.from(tableName as any).select(select);
      
      // Apply user-provided filters first
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
          console.log(`useRealData - Applied filter: ${key} = ${value}`);
        }
      });
      
      // CRITICAL SECURITY: Automatically enforce business filtering for non-super-admins
      if (enforceBusinessFilter && !isSuperAdmin && businessId) {
        // Define which tables are global and don't need business filtering
        const globalTables = [
          'businesses', 
          'modules_config', 
          'supported_integrations', 
          'profiles'
        ];
        
        if (!globalTables.includes(tableName)) {
          console.log(`useRealData - SECURITY: Adding mandatory business filter for ${tableName}: ${businessId}`);
          query = query.eq('business_id', businessId);
        }
      }

      // Apply ordering if specified
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending });
        console.log(`useRealData - Applied ordering: ${orderBy.column} ${orderBy.ascending ? 'ASC' : 'DESC'}`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`useRealData - Error fetching ${tableName}:`, error);
        throw error;
      }
      
      console.log(`useRealData - Successfully fetched ${data?.length || 0} records from ${tableName} with business isolation`);
      return (data as T[]) || [];
    },
    enabled: enabled && !!profile,
  });
}

// Business-specific secure hooks with automatic business_id filtering
export function useBusinessesData() {
  const { profile } = useAuth();
  const { isSuperAdmin } = useCurrentBusiness();
  
  console.log('useBusinessesData - Called with profile:', {
    userEmail: profile?.email,
    userRole: profile?.role,
    isSuperAdmin,
    userId: profile?.id
  });
  
  return useRealData<any>({
    queryKey: ['businesses'],
    tableName: 'businesses',
    filters: isSuperAdmin ? {} : { owner_id: profile?.id }, // Super admins see all, others see only owned
    enforceBusinessFilter: false, // businesses table doesn't need business_id filter
    orderBy: { column: 'name', ascending: true }
  });
}

export function useIntegrationsData() {
  return useRealData<any>({
    queryKey: ['supported-integrations'],
    tableName: 'supported_integrations',
    enforceBusinessFilter: false, // Global table
    orderBy: { column: 'display_name', ascending: true }
  });
}

export function useBusinessIntegrationsData() {
  const { businessId } = useCurrentBusiness();
  
  return useRealData<any>({
    queryKey: ['business-integrations', businessId],
    tableName: 'business_integrations',
    filters: businessId ? { business_id: businessId } : {},
    enabled: !!businessId,
    enforceBusinessFilter: true // This table needs business_id filtering
  });
}
