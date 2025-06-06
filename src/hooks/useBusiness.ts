
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export const useBusiness = () => {
  const { user } = useAuth();
  const { businessId: urlBusinessId } = useParams();

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

  // If we have a business ID from URL, use that to fetch business details
  const { data: urlBusiness, isLoading: urlBusinessLoading } = useQuery({
    queryKey: ['business-by-id', urlBusinessId],
    queryFn: async () => {
      if (!urlBusinessId) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', urlBusinessId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching business by ID:', error);
        return null;
      }
      return data;
    },
    enabled: !!urlBusinessId,
  });

  // Also fetch business by owner for cases where user owns a business
  const { data: ownedBusiness, isLoading: ownedBusinessLoading } = useQuery({
    queryKey: ['business', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching owned business:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id && !urlBusinessId, // Only fetch if no URL business ID
  });

  // Determine which business to use: URL business takes priority
  const business = urlBusiness || ownedBusiness;
  const businessId = urlBusinessId || business?.id;

  // Get business integrations count
  const { data: integrationsCount } = useQuery({
    queryKey: ['business-integrations-count', businessId],
    queryFn: async () => {
      if (!businessId) return 0;
      
      const { count, error } = await supabase
        .from('business_integrations')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching integrations count:', error);
        return 0;
      }
      return count || 0;
    },
    enabled: !!businessId,
  });

  return {
    user,
    profile,
    business,
    businessId,
    isSuperAdmin: profile?.role === 'super_admin',
    isBusinessOwner: !!ownedBusiness,
    isLoading: profileLoading || urlBusinessLoading || ownedBusinessLoading,
    integrationsCount: integrationsCount || 0,
  };
};
