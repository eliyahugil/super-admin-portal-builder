import { useState, useEffect, useCallback, useMemo, startTransition } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { useUserBusinesses } from './useUserBusinesses';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const SELECTED_BUSINESS_KEY = 'selectedBusinessId';

export interface UseCurrentBusinessReturn {
  businessId: string | null;
  role: 'super_admin' | 'business_admin' | 'business_user' | null;
  loading: boolean;
  isSuperAdmin: boolean;
  businessName: string | null;
  availableBusinesses: any[];
  hasMultipleBusinesses: boolean;
  error: string | null;
  setSelectedBusinessId: (businessId: string | null) => void;
  selectBusiness: (businessId: string | null) => void;
}

let logThrottle = 0; // For log throttling

export const useCurrentBusiness = (): UseCurrentBusinessReturn => {
  const { user, profile } = useAuth();
  const { businessId: urlBusinessId } = useParams<{ businessId: string }>();
  const { data: userBusinesses, isLoading: userBusinessesLoading } = useUserBusinesses();
  const queryClient = useQueryClient();

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [role, setRole] = useState<'super_admin' | 'business_admin' | 'business_user' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is authorized super admin
  const isAuthorizedSuperUser = useMemo(() => {
    return user?.email === 'eligil1308@gmail.com' || profile?.role === 'super_admin';
  }, [user?.email, profile?.role]);

  const isSuperAdmin = isAuthorizedSuperUser;

  // Throttled logging function
  const logState = useCallback((state: any) => {
    const now = Date.now();
    if (now - logThrottle > 2000) { // Log only every 2 seconds
      console.log('📊 useCurrentBusiness - Current state:', state);
      logThrottle = now;
    }
  }, []);

  const setSelectedBusinessId = useCallback((newBusinessId: string | null) => {
    console.log('🔄 setSelectedBusinessId called with:', newBusinessId);
    setBusinessId(newBusinessId);
    setRole(isSuperAdmin ? 'super_admin' : null);
    
    if (newBusinessId) {
      localStorage.setItem(SELECTED_BUSINESS_KEY, newBusinessId);
      // Update business name and role based on available businesses
      if (userBusinesses) {
        const business = userBusinesses.find(ub => ub.business_id === newBusinessId);
        if (business) {
          setBusinessName(business.business.name);
          setRole((business.role as any) || (isSuperAdmin ? 'super_admin' : null));
        }
      }
    } else {
      localStorage.removeItem(SELECTED_BUSINESS_KEY);
      setBusinessName(null);
    }
  }, [userBusinesses, isSuperAdmin]);

  const selectBusiness = useCallback((newBusinessId: string | null) => {
    // 1) Optimistic update
    setSelectedBusinessId(newBusinessId);

    // 2) Targeted invalidation in transition for snappy UI
    startTransition(() => {
      const keysToInvalidate: any[] = [
        ['business.active'],
        ['employees', newBusinessId],
        ['shifts', newBusinessId],
        ['orders', newBusinessId],
        ['products', newBusinessId],
        ['settings', newBusinessId],
      ];
      keysToInvalidate.forEach((k) => queryClient.invalidateQueries({ queryKey: k }));
    });

    // 3) Feedback toast
    toast({ title: 'העסק הוחלף', description: 'הדפים מתעדכנים ברקע' });
  }, [queryClient, setSelectedBusinessId, toast]);

  useEffect(() => {
    // Early return if still loading user data
    if (!profile && !user) {
      return;
    }

    // Early return if still loading user businesses
    if (userBusinessesLoading) {
      setLoading(true);
      return;
    }

    setError(null);

    // Log current state (throttled)
    logState({
      businessId,
      role,
      businessName,
      isSuperAdmin,
      loading,
      availableBusinesses: userBusinesses?.length || 0,
      error,
      isAuthorizedSuperUser,
      userEmail: user?.email,
      savedInLocalStorage: localStorage.getItem(SELECTED_BUSINESS_KEY)
    });

    // Priority 1: URL parameter
    if (urlBusinessId && userBusinesses) {
      const urlBusiness = userBusinesses.find(ub => ub.business_id === urlBusinessId);
      if (urlBusiness) {
        if (businessId !== urlBusinessId) {
          console.log('🔗 Setting business from URL:', urlBusinessId);
          setBusinessId(urlBusinessId);
          setBusinessName(urlBusiness.business.name);
          setRole(urlBusiness.role || (isSuperAdmin ? 'super_admin' : null));
          localStorage.setItem(SELECTED_BUSINESS_KEY, urlBusinessId);
        }
        setLoading(false);
        return;
      } else if (isSuperAdmin) {
        // Super admin can access any business
        if (businessId !== urlBusinessId) {
          console.log('👑 Super admin accessing business from URL:', urlBusinessId);
          setBusinessId(urlBusinessId);
          setRole('super_admin');
          localStorage.setItem(SELECTED_BUSINESS_KEY, urlBusinessId);
        }
        setLoading(false);
        return;
      } else {
        setError('אין לך הרשאה לעסק זה');
        setLoading(false);
        return;
      }
    }

    // Priority 2: localStorage
    if (!urlBusinessId) {
      const savedBusinessId = localStorage.getItem(SELECTED_BUSINESS_KEY);
      if (savedBusinessId && userBusinesses) {
        const savedBusiness = userBusinesses.find(ub => ub.business_id === savedBusinessId);
        if (savedBusiness) {
          if (businessId !== savedBusinessId) {
            console.log('💾 Setting business from localStorage:', savedBusinessId);
            setBusinessId(savedBusinessId);
            setBusinessName(savedBusiness.business.name);
            setRole(savedBusiness.role || (isSuperAdmin ? 'super_admin' : null));
          }
          setLoading(false);
          return;
        } else if (isSuperAdmin) {
          // Super admin can use saved business even if not in list
          if (businessId !== savedBusinessId) {
            console.log('👑 Super admin using saved business:', savedBusinessId);
            setBusinessId(savedBusinessId);
            setRole('super_admin');
          }
          setLoading(false);
          return;
        } else {
          localStorage.removeItem(SELECTED_BUSINESS_KEY);
        }
      }
    }

    // Priority 3: First available business (non-super-admin only)
    if (!isSuperAdmin && userBusinesses && userBusinesses.length > 0 && !businessId) {
      const firstBusiness = userBusinesses[0];
      console.log('🎯 Setting first available business:', firstBusiness.business_id);
      setBusinessId(firstBusiness.business_id);
      setBusinessName(firstBusiness.business.name);
      setRole(firstBusiness.role);
      localStorage.setItem(SELECTED_BUSINESS_KEY, firstBusiness.business_id);
      setLoading(false);
      return;
    }

    // For super admin without selection
    if (isSuperAdmin && !businessId) {
      console.log('👑 Super admin - no business selected');
      setRole('super_admin');
      setLoading(false);
      return;
    }

    // No businesses available for regular user
    if (!isSuperAdmin && userBusinesses && userBusinesses.length === 0) {
      setError('לא נמצא עסק משויך למשתמש זה');
      setLoading(false);
      return;
    }

    // Default case
    setLoading(false);
  }, [
    businessId,
    userBusinesses,
    userBusinessesLoading,
    urlBusinessId,
    isSuperAdmin,
    user?.email,
    profile?.id,
    logState
  ]);

  return {
    businessId,
    role,
    loading,
    isSuperAdmin,
    businessName,
    availableBusinesses: userBusinesses || [],
    hasMultipleBusinesses: (userBusinesses?.length || 0) > 1,
    error,
    setSelectedBusinessId,
    selectBusiness,
  };
};