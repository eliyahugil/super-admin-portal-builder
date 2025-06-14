
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface UseArchivedDataOptions {
  tableName: string;
  queryKey: string[];
  selectedBusinessId?: string | null;
  select?: string;
  orderBy?: { column: string; ascending: boolean };
}

export const useArchivedData = <T = any>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*',
  orderBy = { column: 'created_at', ascending: false }
}: UseArchivedDataOptions) => {
  const { profile } = useAuth();
  const { businessId, isSuperAdmin } = useCurrentBusiness();

  const targetBusinessId = selectedBusinessId || businessId;

  console.log(`🗃️ useArchivedData - Query parameters for ${tableName}:`, {
    userRole: profile?.role,
    businessId,
    selectedBusinessId,
    targetBusinessId,
    isSuperAdmin
  });

  return useQuery({
    queryKey: [...queryKey, 'archived', targetBusinessId, profile?.role],
    queryFn: async (): Promise<T[]> => {
      console.log(`📊 useArchivedData - Starting query for ${tableName}...`);
      
      if (!profile) {
        console.log('❌ No profile available');
        throw new Error('User profile not available');
      }

      if (!targetBusinessId && !isSuperAdmin) {
        console.log('❌ No business ID available for non-super admin');
        throw new Error('Business ID required');
      }

      let query = supabase
        .from(tableName)
        .select(select)
        .eq('is_archived', true); // Only fetch archived items

      // Apply business filter for non-super admins or when specific business is selected
      if (targetBusinessId) {
        console.log('🔒 Adding business filter:', targetBusinessId);
        query = query.eq('business_id', targetBusinessId);
      }

      // Apply ordering
      query = query.order(orderBy.column, { ascending: orderBy.ascending });

      const { data, error } = await query;

      if (error) {
        console.error(`❌ Error fetching archived ${tableName}:`, error);
        throw error;
      }

      console.log(`✅ Raw archived ${tableName} data fetched:`, data?.length || 0);

      return (data as T[]) || [];
    },
    enabled: !!profile && (!!targetBusinessId || isSuperAdmin),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
