
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export const useBusiness = () => {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ['business', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching business:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Get business integrations count
  const { data: integrationsCount } = useQuery({
    queryKey: ['business-integrations-count', business?.id],
    queryFn: async () => {
      if (!business?.id) return 0;
      
      const { count, error } = await supabase
        .from('business_integrations')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching integrations count:', error);
        return 0;
      }
      return count || 0;
    },
    enabled: !!business?.id,
  });

  return {
    user,
    profile,
    business,
    businessId: business?.id,
    isSuperAdmin: profile?.role === 'super_admin',
    isBusinessOwner: !!business,
    isLoading: profileLoading || businessLoading,
    integrationsCount: integrationsCount || 0,
  };
};
