
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface Business {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  contact_email?: string;
  admin_email?: string;
  contact_phone?: string;
}

// Generic useRealData hook for fetching data from any table
export const useRealData = <T = any>({
  queryKey,
  tableName,
  filters = {},
  orderBy,
  enabled = true,
  enforceBusinessFilter = false,
  select = '*',
}: {
  queryKey: string[];
  tableName: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending: boolean };
  enabled?: boolean;
  enforceBusinessFilter?: boolean;
  select?: string;
}) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey,
    queryFn: async (): Promise<T[]> => {
      console.log(`🔍 useRealData - Querying ${tableName}...`);
      
      if (!enabled) {
        return [];
      }

      // Use the RPC function for dynamic table queries
      const { data, error } = await supabase.rpc('select_from_table', {
        table_name: tableName,
        select_clause: select,
        where_clause: Object.entries(filters)
          .filter(([key, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => `${key} = '${value}'`)
          .join(' AND ') || null
      });

      if (error) {
        console.error(`❌ Error querying ${tableName}:`, error);
        throw error;
      }

      // Safely handle the Json type - check if it's an array before accessing length
      const resultLength = Array.isArray(data) ? data.length : (data ? 1 : 0);
      console.log(`✅ ${tableName} data fetched:`, resultLength);
      
      // Return empty array if data is null/undefined, otherwise ensure it's an array
      return Array.isArray(data) ? (data as T[]) : (data ? [data as T] : []);
    },
    enabled: enabled && !!profile,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook לשליפת נתוני העסקים
export const useBusinessesData = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['businesses-data', profile?.role],
    queryFn: async (): Promise<Business[]> => {
      console.log('🏢 useBusinessesData - Starting query...');
      
      if (!profile) {
        console.log('❌ No profile available');
        return [];
      }

      // For super admin, get all businesses
      if (profile.role === 'super_admin') {
        console.log('👑 Fetching all businesses for super admin');
        
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, description, logo_url, is_active, created_at, contact_email, admin_email, contact_phone')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error('❌ Error fetching businesses:', error);
          throw error;
        }

        console.log('✅ Businesses fetched:', data?.length || 0);
        return data || [];
      }

      // For regular users, get their businesses through user_businesses
      console.log('👤 Fetching user businesses for regular user');
      
      const { data, error } = await supabase
        .from('user_businesses')
        .select(`
          business:businesses!inner (
            id,
            name,
            description,
            logo_url,
            is_active,
            created_at,
            contact_email,
            admin_email,
            contact_phone
          )
        `)
        .eq('user_id', profile.id)
        .eq('business.is_active', true);

      if (error) {
        console.error('❌ Error fetching user businesses:', error);
        throw error;
      }

      console.log('✅ User businesses fetched:', data?.length || 0);
      
      // Transform the data structure
      return data?.map(item => item.business) || [];
    },
    enabled: !!profile,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for integrations data
export const useIntegrationsData = () => {
  return useQuery({
    queryKey: ['supported-integrations'],
    queryFn: async () => {
      console.log('🔗 Fetching supported integrations...');
      
      const { data, error } = await supabase
        .from('supported_integrations')
        .select('*')
        .eq('is_active', true)
        .order('display_name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching integrations:', error);
        throw error;
      }

      console.log('✅ Integrations fetched:', data?.length || 0);
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

// Hook for business integrations data
export const useBusinessIntegrationsData = (businessId?: string) => {
  return useQuery({
    queryKey: ['business-integrations', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      console.log('🏢 Fetching business integrations for:', businessId);
      
      const { data, error } = await supabase
        .from('business_integrations')
        .select('*')
        .eq('business_id', businessId)
        .order('display_name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching business integrations:', error);
        throw error;
      }

      console.log('✅ Business integrations fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
  });
};
