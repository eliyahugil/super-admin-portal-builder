
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface UserBusiness {
  id: string;
  user_id: string;
  business_id: string;
  role: string;
  created_at: string;
  business: {
    id: string;
    name: string;
    description?: string;
    logo_url?: string;
    is_active: boolean;
  };
}

export function useUserBusinesses() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['user-businesses', user?.id, profile?.role],
    queryFn: async (): Promise<UserBusiness[]> => {
      if (!user?.id || !profile) {
        console.log('⚠️ useUserBusinesses: No user or profile available');
        return [];
      }

      console.log('🔍 useUserBusinesses: Fetching businesses for user:', {
        userId: user.id,
        role: profile.role,
        isSuperAdmin: profile.role === 'super_admin'
      });

      // If super admin, they can access all active businesses
      if (profile.role === 'super_admin') {
        console.log('👑 Fetching all businesses for super admin');
        
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error('❌ Error fetching businesses for super admin:', error);
          throw error;
        }

        console.log('✅ Super admin businesses fetched:', data?.length || 0);

        // Transform to match UserBusiness interface
        return data?.map(business => ({
          id: `super_admin_${business.id}`, // Unique ID for super admin access
          user_id: user.id,
          business_id: business.id,
          role: 'super_admin',
          created_at: business.created_at,
          business: {
            id: business.id,
            name: business.name,
            description: business.description,
            logo_url: business.logo_url,
            is_active: business.is_active
          }
        })) || [];
      }

      // For regular users, get their business associations
      console.log('👤 Fetching user business associations');
      
      const { data, error } = await supabase
        .from('user_businesses')
        .select(`
          *,
          business:businesses!inner (
            id,
            name,
            description,
            logo_url,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('business.is_active', true);

      if (error) {
        console.error('❌ Error fetching user businesses:', error);
        throw error;
      }

      console.log('✅ User businesses fetched:', data?.length || 0);
      
      return data || [];
    },
    enabled: !!user?.id && !!profile,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCurrentUserBusiness(businessId: string | null) {
  const { data: userBusinesses } = useUserBusinesses();

  return userBusinesses?.find(ub => ub.business_id === businessId) || null;
}
