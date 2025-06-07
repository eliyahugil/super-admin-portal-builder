
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export const useBusiness = () => {
  const { user, profile } = useAuth();
  const { businessId: urlBusinessId } = useParams();

  console.log('useBusiness - Current state:', {
    user: user?.email,
    profile: profile?.role,
    urlBusinessId,
    isSuperAdmin: profile?.role === 'super_admin'
  });

  // If we have a business ID from URL, use that to fetch business details
  const { data: urlBusiness, isLoading: urlBusinessLoading } = useQuery({
    queryKey: ['business-by-id', urlBusinessId],
    queryFn: async () => {
      if (!urlBusinessId) return null;
      
      console.log('Fetching business by URL ID:', urlBusinessId);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', urlBusinessId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching business by ID:', error);
        return null;
      }
      console.log('URL Business fetched:', data);
      return data;
    },
    enabled: !!urlBusinessId,
  });

  // Also fetch business by owner for cases where user owns a business
  const { data: ownedBusiness, isLoading: ownedBusinessLoading } = useQuery({
    queryKey: ['business', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching owned business for user:', user.id);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching owned business:', error);
        return null;
      }
      console.log('Owned business fetched:', data);
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

  const isSuperAdmin = profile?.role === 'super_admin';
  const isBusinessOwner = !!ownedBusiness;

  console.log('useBusiness - Final state:', {
    business: business?.name,
    businessId,
    isSuperAdmin,
    isBusinessOwner,
    hasOwnedBusiness: !!ownedBusiness,
    hasUrlBusiness: !!urlBusiness
  });

  return {
    user,
    profile,
    business,
    businessId,
    isSuperAdmin,
    isBusinessOwner,
    isLoading: urlBusinessLoading || ownedBusinessLoading,
    integrationsCount: integrationsCount || 0,
  };
};
