
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
  const { businessId } = useCurrentBusiness();

  return useQuery({
    queryKey,
    queryFn: async (): Promise<T[]> => {
      console.log(`useRealData - Fetching from ${tableName}`, { 
        filters, 
        businessId, 
        isSuperAdmin: profile?.role === 'super_admin',
        enforceBusinessFilter,
        userProfile: profile?.email
      });
      
      // Create a more flexible query builder
      let query = supabase.from(tableName as any).select(select);
      
      // Apply user-provided filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
          console.log(`useRealData - Applied filter: ${key} = ${value}`);
        }
      });
      
      // Automatically enforce business filtering for non-super-admins
      if (enforceBusinessFilter && profile?.role !== 'super_admin' && businessId) {
        // For now, simply apply business_id filter if the table likely has it
        // This is a simpler approach than checking schema
        if (tableName !== 'businesses' && tableName !== 'modules_config' && tableName !== 'supported_integrations') {
          console.log(`useRealData - Adding business filter for ${tableName}: ${businessId}`);
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
      
      console.log(`useRealData - Successfully fetched ${data?.length || 0} records from ${tableName}`, data);
      return (data as T[]) || [];
    },
    enabled: enabled && !!profile,
  });
}

// Business-specific hooks with proper TypeScript interfaces
interface IntegrationType {
  id: string;
  integration_name: string;
  display_name: string;
  description: string;
  category: string;
  icon: string;
  requires_global_key: boolean;
  requires_business_credentials: boolean;
  is_active: boolean;
  credential_fields: any[];
  created_at: string;
  documentation_url?: string;
}

interface BusinessType {
  id: string;
  name: string;
  contact_email: string;
  admin_email: string;
  contact_phone: string;
  is_active: boolean;
  created_at: string;
  owner_id: string;
  description?: string;
  website?: string;
  address?: string;
  logo_url?: string;
  updated_at: string;
}

interface BusinessIntegrationType {
  id: string;
  business_id: string;
  integration_name: string;
  display_name: string;
  is_active: boolean;
  credentials: Record<string, any>;
  config: Record<string, any>;
  last_tested_at?: string;
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export function useIntegrationsData() {
  return useRealData<IntegrationType>({
    queryKey: ['supported-integrations'],
    tableName: 'supported_integrations',
    enforceBusinessFilter: false,
    orderBy: { column: 'display_name', ascending: true }
  });
}

export function useBusinessIntegrationsData() {
  const { businessId } = useCurrentBusiness();
  
  return useRealData<BusinessIntegrationType>({
    queryKey: ['business-integrations', businessId],
    tableName: 'business_integrations',
    filters: businessId ? { business_id: businessId } : {},
    enabled: !!businessId,
    enforceBusinessFilter: true
  });
}

export function useBusinessesData() {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';
  
  console.log('useBusinessesData - Called with profile:', {
    userEmail: profile?.email,
    userRole: profile?.role,
    isSuperAdmin,
    userId: profile?.id
  });
  
  return useRealData<BusinessType>({
    queryKey: ['businesses'],
    tableName: 'businesses',
    filters: isSuperAdmin ? {} : { owner_id: profile?.id },
    enforceBusinessFilter: false,
    orderBy: { column: 'name', ascending: true }
  });
}
