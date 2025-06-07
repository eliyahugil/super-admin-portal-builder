
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
        
        // If super admin, they don't have a specific business
        if (profile.role === 'super_admin') {
          console.log('useCurrentBusiness - Super admin detected');
          setBusinessId(null);
          setBusinessName('מנהל ראשי');
          setLoading(false);
          return;
        }

        // For regular users, find their business
        console.log('useCurrentBusiness - Finding business for regular user:', user.id);
        
        const { data: userBusiness, error } = await supabase
          .from('businesses')
          .select('id, name')
          .eq('owner_id', user.id)
          .single();

        if (error) {
          console.error('useCurrentBusiness - Error fetching business:', error);
          if (error.code !== 'PGRST116') { // Not found error is expected sometimes
            throw error;
          }
          setBusinessId(null);
          setBusinessName(null);
        } else {
          console.log('useCurrentBusiness - Found business:', userBusiness);
          setBusinessId(userBusiness.id);
          setBusinessName(userBusiness.name);
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
    loading
  });

  return { 
    businessId, 
    role, 
    loading, 
    isSuperAdmin,
    businessName 
  };
}
