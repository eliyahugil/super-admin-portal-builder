
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
    queryKey: ['user-businesses', user?.id],
    queryFn: async (): Promise<UserBusiness[]> => {
      if (!user?.id) return [];

      // If super admin, they can access all businesses
      if (profile?.role === 'super_admin') {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) throw error;

        // Transform to match UserBusiness interface
        return data?.map(business => ({
          id: business.id,
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
      const { data, error } = await supabase
        .from('user_businesses')
        .select(`
          *,
          business:businesses (
            id,
            name,
            description,
            logo_url,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('business.is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!profile,
  });
}

export function useCurrentUserBusiness(businessId: string | null) {
  const { data: userBusinesses } = useUserBusinesses();

  return userBusinesses?.find(ub => ub.business_id === businessId) || null;
}
