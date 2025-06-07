
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseRealDataOptions {
  queryKey: string[];
  tableName: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  enabled?: boolean;
  enforceBusinessFilter?: boolean;
}

export function useRealData<T = any>({
  queryKey,
  tableName,
  select = '*',
  filters = {},
  orderBy,
  enabled = true,
  enforceBusinessFilter = false
}: UseRealDataOptions) {
  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      console.log(`=== useRealData: Fetching from ${tableName} ===`);
      console.log('Initial Filters:', filters);
      console.log('Select:', select);
      console.log('Enforce Business Filter:', enforceBusinessFilter);
      
      let finalFilters = { ...filters };

      // Apply business filtering for non-super-admin users
      if (enforceBusinessFilter) {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        
        if (user) {
          // Get user profile to check role and business association
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          console.log('User profile for filtering:', profile);

          // If not super admin, filter by business
          if (profile?.role !== 'super_admin') {
            // Get user's business from businesses table (owner_id)
            const { data: userBusiness } = await supabase
              .from('businesses')
              .select('id')
              .eq('owner_id', user.id)
              .single();

            if (userBusiness) {
              finalFilters.business_id = userBusiness.id;
              console.log('Applied business filter for user:', userBusiness.id);
            } else {
              // If user has no business, return empty results
              console.log('User has no business - returning empty results');
              return [];
            }
          } else {
            console.log('Super admin detected - no business filtering applied');
          }
        }
      }

      console.log('Final Filters:', finalFilters);

      // Use type assertion to bypass TypeScript's strict typing
      let query = (supabase as any).from(tableName).select(select);
      
      // Apply filters
      Object.entries(finalFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      
      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching from ${tableName}:`, error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} records from ${tableName}`);
      return (data || []) as T[];
    },
    enabled,
  });

  // Return the query result with loading mapped from isLoading
  return {
    ...queryResult,
    loading: queryResult.isLoading
  };
}

// Specialized hooks for common use cases
export function useIntegrationsData() {
  return useRealData<any>({
    queryKey: ['supported-integrations'],
    tableName: 'supported_integrations',
    filters: { is_active: true },
    orderBy: { column: 'category', ascending: true }
    // No business filter - integrations are global
  });
}

export function useBusinessIntegrationsData(businessId?: string) {
  return useRealData<any>({
    queryKey: ['business-integrations', businessId],
    tableName: 'business_integrations',
    select: '*, businesses!inner(name)',
    filters: businessId ? { business_id: businessId } : {},
    orderBy: { column: 'created_at', ascending: false },
    enabled: true,
    enforceBusinessFilter: !businessId // Auto-filter if no specific businessId provided
  });
}

export function useEmployeesData(businessId?: string) {
  return useRealData<any>({
    queryKey: ['employees', businessId],
    tableName: 'employees',
    select: '*, main_branch:branches(name)',
    filters: businessId ? { business_id: businessId } : {},
    orderBy: { column: 'created_at', ascending: false },
    enabled: true,
    enforceBusinessFilter: !businessId // Auto-filter if no specific businessId provided
  });
}

export function useBranchesData(businessId?: string) {
  return useRealData<any>({
    queryKey: ['branches', businessId],
    tableName: 'branches',
    filters: businessId ? { business_id: businessId } : {},
    orderBy: { column: 'created_at', ascending: false },
    enabled: true,
    enforceBusinessFilter: !businessId // Auto-filter if no specific businessId provided
  });
}

// New hook specifically for businesses (for admin use)
export function useBusinessesData() {
  return useRealData<any>({
    queryKey: ['businesses'],
    tableName: 'businesses',
    orderBy: { column: 'created_at', ascending: false },
    enforceBusinessFilter: true // This will show only user's businesses unless super admin
  });
}
