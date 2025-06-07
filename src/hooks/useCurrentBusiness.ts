
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface UseCurrentBusinessResult {
  businessId: string | null;
  role: string | null;
  loading: boolean;
  isSuperAdmin: boolean;
  businessName: string | null;
}

export function useCurrentBusiness(): UseCurrentBusinessResult {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    const fetchCurrentBusiness = async () => {
      console.log('useCurrentBusiness - Starting fetch');
      setLoading(true);
      
      try {
        if (!user || !profile) {
          console.log('useCurrentBusiness - No user or profile available');
          setBusinessId(null);
          setRole(null);
          setBusinessName(null);
          setLoading(false);
          return;
        }

        // Set role from profile
        setRole(profile.role);
        
        // If super admin, they don't have a specific business but can see all
        if (profile.role === 'super_admin') {
          console.log('useCurrentBusiness - Super admin detected');
          setBusinessId(null);
          setBusinessName('מנהל ראשי');
          setLoading(false);
          return;
        }

        // Check if user has a business assigned in their profile
        if (profile.business_id) {
          console.log('useCurrentBusiness - User has assigned business:', profile.business_id);
          
          // Fetch business details
          const { data: business, error } = await supabase
            .from('businesses')
            .select('id, name')
            .eq('id', profile.business_id)
            .single();

          if (error) {
            console.error('useCurrentBusiness - Error fetching assigned business:', error);
            setBusinessId(null);
            setBusinessName(null);
          } else {
            console.log('useCurrentBusiness - Found assigned business:', business);
            setBusinessId(business.id);
            setBusinessName(business.name);
          }
        } else {
          // For users without assigned business, check if they own any businesses
          console.log('useCurrentBusiness - No assigned business, checking owned businesses for user:', user.id);
          
          const { data: ownedBusinesses, error } = await supabase
            .from('businesses')
            .select('id, name')
            .eq('owner_id', user.id)
            .limit(1)
            .single();

          if (error) {
            console.error('useCurrentBusiness - Error fetching owned business:', error);
            if (error.code !== 'PGRST116') { // Not found error is expected sometimes
              throw error;
            }
            setBusinessId(null);
            setBusinessName(null);
          } else {
            console.log('useCurrentBusiness - Found owned business:', ownedBusinesses);
            setBusinessId(ownedBusinesses.id);
            setBusinessName(ownedBusinesses.name);
          }
        }
      } catch (error) {
        console.error('useCurrentBusiness - Exception:', error);
        setBusinessId(null);
        setRole(null);
        setBusinessName(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentBusiness();
  }, [user, profile]);

  const isSuperAdmin = profile?.role === 'super_admin';

  console.log('useCurrentBusiness - Current state:', {
    businessId,
    role,
    businessName,
    isSuperAdmin,
    loading,
    profileBusinessId: profile?.business_id
  });

  return { 
    businessId, 
    role, 
    loading, 
    isSuperAdmin,
    businessName 
  };
}
