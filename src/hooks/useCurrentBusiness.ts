
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useUserBusinesses } from './useUserBusinesses';
import { useParams } from 'react-router-dom';

interface UseCurrentBusinessResult {
  businessId: string | null;
  role: string | null;
  loading: boolean;
  isSuperAdmin: boolean;
  businessName: string | null;
  availableBusinesses: any[];
  hasMultipleBusinesses: boolean;
}

export function useCurrentBusiness(): UseCurrentBusinessResult {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const { user, profile, loading: authLoading } = useAuth();
  const { data: userBusinesses, isLoading: businessesLoading } = useUserBusinesses();
  const { businessId: urlBusinessId } = useParams();

  const isSuperAdmin = profile?.role === 'super_admin';
  const loading = authLoading || businessesLoading;

  useEffect(() => {
    if (loading || !user || !profile) return;

    // Set role from profile
    setRole(profile.role);

    // If we have a business ID from URL, use that
    if (urlBusinessId && userBusinesses) {
      const urlBusiness = userBusinesses.find(ub => ub.business_id === urlBusinessId);
      if (urlBusiness) {
        setBusinessId(urlBusiness.business_id);
        setBusinessName(urlBusiness.business.name);
        return;
      }
    }

    // If super admin without URL business ID, don't set a specific business
    if (isSuperAdmin && !urlBusinessId) {
      setBusinessId(null);
      setBusinessName('מנהל ראשי');
      return;
    }

    // For regular users, set their first business or the one from URL
    if (userBusinesses && userBusinesses.length > 0) {
      const firstBusiness = userBusinesses[0];
      setBusinessId(firstBusiness.business_id);
      setBusinessName(firstBusiness.business.name);
    } else {
      setBusinessId(null);
      setBusinessName(null);
    }
  }, [user, profile, userBusinesses, urlBusinessId, isSuperAdmin, loading]);

  console.log('useCurrentBusiness - Current state:', {
    businessId,
    role,
    businessName,
    isSuperAdmin,
    loading,
    availableBusinesses: userBusinesses?.length || 0
  });

  return { 
    businessId, 
    role, 
    loading, 
    isSuperAdmin,
    businessName,
    availableBusinesses: userBusinesses || [],
    hasMultipleBusinesses: (userBusinesses?.length || 0) > 1
  };
}
