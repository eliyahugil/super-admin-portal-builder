
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseRealDataOptions {
  queryKey: string[];
  tableName: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  enabled?: boolean;
}

export function useRealData<T = any>({
  queryKey,
  tableName,
  select = '*',
  filters = {},
  orderBy,
  enabled = true
}: UseRealDataOptions) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      console.log(`=== useRealData: Fetching from ${tableName} ===`);
      console.log('Filters:', filters);
      console.log('Select:', select);
      
      // Use type assertion to bypass TypeScript's strict typing
      let query = (supabase as any).from(tableName).select(select);
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
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
}

// Specialized hooks for common use cases
export function useIntegrationsData(businessId?: string) {
  return useRealData<any>({
    queryKey: ['supported-integrations'],
    tableName: 'supported_integrations',
    filters: { is_active: true },
    orderBy: { column: 'category', ascending: true }
  });
}

export function useBusinessIntegrationsData(businessId?: string) {
  return useRealData<any>({
    queryKey: ['business-integrations', businessId],
    tableName: 'business_integrations',
    select: '*, businesses!inner(name)',
    filters: businessId ? { business_id: businessId } : {},
    orderBy: { column: 'created_at', ascending: false },
    enabled: !!businessId
  });
}

export function useEmployeesData(businessId?: string) {
  return useRealData<any>({
    queryKey: ['employees', businessId],
    tableName: 'employees',
    select: '*, main_branch:branches(name)',
    filters: businessId ? { business_id: businessId } : {},
    orderBy: { column: 'created_at', ascending: false },
    enabled: !!businessId
  });
}

export function useBranchesData(businessId?: string) {
  return useRealData<any>({
    queryKey: ['branches', businessId],
    tableName: 'branches',
    filters: businessId ? { business_id: businessId } : {},
    orderBy: { column: 'created_at', ascending: false },
    enabled: !!businessId
  });
}
