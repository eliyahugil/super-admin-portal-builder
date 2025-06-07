
import { useQuery, QueryKey } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from './useCurrentBusiness';

interface UseRealDataOptions {
  queryKey: QueryKey;
  tableName: string;
  filters?: Record<string, any>;
  enabled?: boolean;
  enforceBusinessFilter?: boolean; // New option to automatically enforce business filtering
}

export function useRealData<T = any>({ 
  queryKey, 
  tableName, 
  filters = {}, 
  enabled = true,
  enforceBusinessFilter = true
}: UseRealDataOptions) {
  const { profile } = useAuth();
  const { businessId } = useCurrentBusiness();

  return useQuery({
    queryKey,
    queryFn: async (): Promise<T[]> => {
      console.log(`Fetching data from ${tableName}`, { filters, businessId, isSuperAdmin: profile?.role === 'super_admin' });
      
      let query = supabase.from(tableName).select('*');
      
      // Apply user-provided filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      
      // Automatically enforce business filtering for non-super-admins
      if (enforceBusinessFilter && profile?.role !== 'super_admin' && businessId) {
        // Check if the table has a business_id column
        const tableSchema = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', tableName)
          .eq('column_name', 'business_id')
          .single();
          
        if (!tableSchema.error) {
          console.log(`Adding business filter for ${tableName}: ${businessId}`);
          query = query.eq('business_id', businessId);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} records from ${tableName}`);
      return (data as T[]) || [];
    },
    enabled: enabled && !!profile, // Only run query when profile is loaded
  });
}
