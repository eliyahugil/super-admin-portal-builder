
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from './useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';

interface Branch {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  gps_radius: number | null;
  is_active: boolean;
  business_id: string;
  created_at: string;
  updated_at: string;
}

// רשימת המשתמשים המורשים לראות את כל העסקים
const AUTHORIZED_SUPER_USERS = [
  'HABULGARTI@gmail.com',
  'eligil1308@gmail.com'
];

/**
 * Unified hook for fetching branch data with consistent business filtering
 */
export function useBranchesData(selectedBusinessId?: string | null) {
  const { profile, user } = useAuth();
  const { businessId, isSuperAdmin, loading: businessLoading } = useCurrentBusiness();

  const userEmail = user?.email?.toLowerCase();
  const isRealSuperAdmin = (userEmail && AUTHORIZED_SUPER_USERS.includes(userEmail)) || 
                          profile?.role === 'super_admin' || 
                          isSuperAdmin;

  // For super admin, use selectedBusinessId if provided, otherwise use their businessId
  // For regular users, always use their businessId
  const effectiveBusinessId = isRealSuperAdmin ? (selectedBusinessId || businessId) : businessId;

  return useQuery({
    queryKey: ['branches', effectiveBusinessId, isRealSuperAdmin, selectedBusinessId],
    queryFn: async (): Promise<Branch[]> => {
      console.log('🔄 useBranchesData - Fetching branches with unified logic:', {
        effectiveBusinessId,
        isRealSuperAdmin,
        selectedBusinessId
      });
      
      let query = supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply same filtering logic as employees
      if (isRealSuperAdmin) {
        if (effectiveBusinessId) {
          console.log('🎯 Super admin filtering branches by business:', effectiveBusinessId);
          query = query.eq('business_id', effectiveBusinessId);
        } else {
          console.log('👁️ Super admin viewing all branches across all businesses');
        }
      } else {
        if (!businessId) {
          console.log('⚠️ No business ID available for branches');
          return [];
        }
        console.log('🏢 Regular user filtering branches by business:', businessId);
        query = query.eq('business_id', businessId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ useBranchesData - Error fetching branches:', error);
        throw error;
      }
      
      console.log('✅ useBranchesData - Successfully fetched branches:', {
        count: data?.length || 0,
        businessFilter: effectiveBusinessId || 'all'
      });
      
      return (data as Branch[]) || [];
    },
    enabled: !businessLoading && !!profile && (!!businessId || isRealSuperAdmin),
  });
}
