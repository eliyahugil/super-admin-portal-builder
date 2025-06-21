
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
  setSelectedBusinessId: (businessId: string | null) => void;
}

// רק המשתמש הזה יוכל לגשת למצב super admin
const AUTHORIZED_SUPER_USER = 'eligil1308@gmail.com';

// מפתח לשמירה ב-localStorage
const SELECTED_BUSINESS_KEY = 'selected_business_id';

export function useCurrentBusiness(): UseCurrentBusinessResult {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { user, profile, loading: authLoading } = useAuth();
  const { data: userBusinesses, isLoading: businessesLoading, error: businessesError } = useUserBusinesses();
  const { businessId: urlBusinessId } = useParams();

  const userEmail = user?.email?.toLowerCase();
  const isAuthorizedSuperUser = userEmail === AUTHORIZED_SUPER_USER;
  
  // המשתמש יהיה super admin רק אם הוא המשתמש המורשה AND הפרופיל שלו מוגדר כ super_admin
  const isSuperAdmin = isAuthorizedSuperUser && profile?.role === 'super_admin';
  const loading = authLoading || businessesLoading;

  // פונקציה לעדכון בחירת העסק
  const setSelectedBusinessId = (newBusinessId: string | null) => {
    console.log('🔄 Setting selected business ID:', newBusinessId);
    setBusinessId(newBusinessId);
    
    // שמירה ב-localStorage
    if (newBusinessId) {
      localStorage.setItem(SELECTED_BUSINESS_KEY, newBusinessId);
    } else {
      localStorage.removeItem(SELECTED_BUSINESS_KEY);
    }

    // עדכון שם העסק
    if (newBusinessId && userBusinesses) {
      const selectedBusiness = userBusinesses.find(ub => ub.business_id === newBusinessId);
      setBusinessName(selectedBusiness?.business.name || null);
    } else if (isSuperAdmin && !newBusinessId) {
      setBusinessName('מנהל ראשי');
    } else {
      setBusinessName(null);
    }
  };

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

    // 1. אם יש business ID ב-URL, השתמש בו (עדיפות ראשונה)
    if (urlBusinessId && userBusinesses) {
      console.log('🎯 useCurrentBusiness: Using URL business:', urlBusinessId);
      
      const urlBusiness = userBusinesses.find(ub => ub.business_id === urlBusinessId);
      if (urlBusiness) {
        console.log('✅ useCurrentBusiness: Found URL business:', urlBusiness.business.name);
        setSelectedBusinessId(urlBusinessId);
        return;
      } else {
        console.warn('⚠️ useCurrentBusiness: URL business not found in user businesses');
        if (!isSuperAdmin) {
          setError('אין לך הרשאה לעסק זה');
          return;
        }
      }
    }

    // 2. אם אין URL business, בדוק localStorage (עדיפות שנייה)
    if (!urlBusinessId) {
      const savedBusinessId = localStorage.getItem(SELECTED_BUSINESS_KEY);
      console.log('💾 useCurrentBusiness: Checking saved business:', savedBusinessId);
      
      if (savedBusinessId && userBusinesses) {
        const savedBusiness = userBusinesses.find(ub => ub.business_id === savedBusinessId);
        if (savedBusiness) {
          console.log('✅ useCurrentBusiness: Using saved business:', savedBusiness.business.name);
          setSelectedBusinessId(savedBusinessId);
          return;
        } else {
          console.warn('⚠️ useCurrentBusiness: Saved business not found, clearing localStorage');
          localStorage.removeItem(SELECTED_BUSINESS_KEY);
        }
      }
    }

    // 3. עבור super admin ללא בחירה ספציפית
    if (isSuperAdmin && !urlBusinessId) {
      console.log('👑 useCurrentBusiness: Super admin without specific business');
      setSelectedBusinessId(null);
      return;
    }

    // 4. עבור משתמשים רגילים - השתמש בעסק הראשון הזמין (עדיפות אחרונה)
    if (userBusinesses && userBusinesses.length > 0) {
      const firstBusiness = userBusinesses[0];
      console.log('🏢 useCurrentBusiness: Using first available business:', firstBusiness.business.name);
      setSelectedBusinessId(firstBusiness.business_id);
    } else if (!isSuperAdmin) {
      console.warn('⚠️ useCurrentBusiness: No businesses available for regular user');
      setSelectedBusinessId(null);
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
    error,
    isAuthorizedSuperUser,
    userEmail,
    savedInLocalStorage: localStorage.getItem(SELECTED_BUSINESS_KEY)
  });

  return { 
    businessId, 
    role, 
    loading, 
    isSuperAdmin,
    businessName,
    availableBusinesses: userBusinesses || [],
    hasMultipleBusinesses: (userBusinesses?.length || 0) > 1,
    error,
    setSelectedBusinessId
  };
}
