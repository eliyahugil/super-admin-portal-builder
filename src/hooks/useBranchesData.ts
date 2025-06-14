
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export interface Branch {
  id: string;
  name: string;
  address?: string;
  business_id: string;
  latitude?: number;
  longitude?: number;
  gps_radius?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useBranchesData = (selectedBusinessId?: string | null) => {
  const { profile } = useAuth();
  const { businessId, isSuperAdmin } = useCurrentBusiness();

  const targetBusinessId = selectedBusinessId || businessId;

  console.log('🏢 useBranchesData - Query parameters:', {
    userRole: profile?.role,
    businessId,
    selectedBusinessId,
    targetBusinessId,
    isSuperAdmin
  });

  return useQuery({
    queryKey: ['branches', targetBusinessId, profile?.role],
    queryFn: async (): Promise<Branch[]> => {
      console.log('🏢 useBranchesData - Starting query...');
      
      if (!profile) {
        console.log('❌ No profile available');
        throw new Error('User profile not available');
      }

      if (!targetBusinessId && !isSuperAdmin) {
        console.log('❌ No business ID available for non-super admin');
        throw new Error('Business ID required');
      }

      let query = supabase
        .from('branches')
        .select('*');

      // Apply business filter for non-super admins or when specific business is selected
      if (targetBusinessId) {
        console.log('🔒 Adding business filter for branches:', targetBusinessId);
        query = query.eq('business_id', targetBusinessId);
      }

      // Order by name
      query = query.order('name', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching branches:', error);
        throw error;
      }

      console.log('✅ Branches data fetched:', {
        count: data?.length || 0,
        targetBusinessId
      });

      return data || [];
    },
    enabled: !!profile && (!!targetBusinessId || isSuperAdmin),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
