
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

  // Fetch ALL businesses owned by the user (not just one)
  const { data: ownedBusinesses, isLoading: ownedBusinessesLoading } = useQuery({
    queryKey: ['owned-businesses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching all owned businesses for user:', user.id);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching owned businesses:', error);
        return [];
      }
      console.log('Owned businesses fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!user?.id && !urlBusinessId, // Only fetch if no URL business ID
  });

  // Determine which business to use: URL business takes priority, otherwise first owned business
  const business = urlBusiness || (ownedBusinesses && ownedBusinesses.length > 0 ? ownedBusinesses[0] : null);
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
  const isBusinessOwner = !!business && ownedBusinesses?.some(b => b.id === business.id);

  console.log('useBusiness - Final state:', {
    business: business?.name,
    businessId,
    isSuperAdmin,
    isBusinessOwner,
    totalOwnedBusinesses: ownedBusinesses?.length || 0,
    hasUrlBusiness: !!urlBusiness
  });

  return {
    user,
    profile,
    business,
    businessId,
    ownedBusinesses: ownedBusinesses || [],
    isSuperAdmin,
    isBusinessOwner,
    isLoading: urlBusinessLoading || ownedBusinessesLoading,
    integrationsCount: integrationsCount || 0,
  };
};
