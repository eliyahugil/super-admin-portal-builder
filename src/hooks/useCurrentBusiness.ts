
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
  error: string | null;
}

export function useCurrentBusiness(): UseCurrentBusinessResult {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { user, profile, loading: authLoading } = useAuth();
  const { data: userBusinesses, isLoading: businessesLoading, error: businessesError } = useUserBusinesses();
  const { businessId: urlBusinessId } = useParams();

  const isSuperAdmin = profile?.role === 'super_admin';
  const loading = authLoading || businessesLoading;

  useEffect(() => {
    setError(null);
    
    if (loading || !user || !profile) {
      console.log('🔄 useCurrentBusiness: Still loading user/profile data');
      return;
    }

    if (businessesError) {
      console.error('❌ useCurrentBusiness: Error loading businesses:', businessesError);
      setError('שגיאה בטעינת העסקים');
      return;
    }

    // Set role from profile
    setRole(profile.role);

    // If we have a business ID from URL, try to use that
    if (urlBusinessId && userBusinesses) {
      console.log('🎯 useCurrentBusiness: Looking for URL business:', urlBusinessId);
      
      const urlBusiness = userBusinesses.find(ub => ub.business_id === urlBusinessId);
      if (urlBusiness) {
        console.log('✅ useCurrentBusiness: Found URL business:', urlBusiness.business.name);
        setBusinessId(urlBusiness.business_id);
        setBusinessName(urlBusiness.business.name);
        return;
      } else {
        console.warn('⚠️ useCurrentBusiness: URL business not found in user businesses');
        if (!isSuperAdmin) {
          setError('אין לך הרשאה לעסק זה');
          return;
        }
      }
    }

    // If super admin without URL business ID, don't set a specific business
    if (isSuperAdmin && !urlBusinessId) {
      console.log('👑 useCurrentBusiness: Super admin without specific business');
      setBusinessId(null);
      setBusinessName('מנהל ראשי');
      return;
    }

    // For regular users or when businesses are available
    if (userBusinesses && userBusinesses.length > 0) {
      const firstBusiness = userBusinesses[0];
      console.log('🏢 useCurrentBusiness: Using first available business:', firstBusiness.business.name);
      setBusinessId(firstBusiness.business_id);
      setBusinessName(firstBusiness.business.name);
    } else if (!isSuperAdmin) {
      console.warn('⚠️ useCurrentBusiness: No businesses available for regular user');
      setBusinessId(null);
      setBusinessName(null);
      setError('לא נמצאו עסקים זמינים');
    }
  }, [user, profile, userBusinesses, urlBusinessId, isSuperAdmin, loading, businessesError]);

  console.log('📊 useCurrentBusiness - Current state:', {
    businessId,
    role,
    businessName,
    isSuperAdmin,
    loading,
    availableBusinesses: userBusinesses?.length || 0,
    error
  });

  return { 
    businessId, 
    role, 
    loading, 
    isSuperAdmin,
    businessName,
    availableBusinesses: userBusinesses || [],
    hasMultipleBusinesses: (userBusinesses?.length || 0) > 1,
    error
  };
}
