
import { useAuth } from '@/components/auth/AuthContext';

// רק המשתמש הזה מורשה להיות super admin
const AUTHORIZED_SUPER_USER = 'eligil1308@gmail.com';

export function useIsSuperAdmin() {
  const { user, profile, loading } = useAuth();
  
  const userEmail = user?.email?.toLowerCase();
  const isAuthorizedSuperUser = userEmail === AUTHORIZED_SUPER_USER;
  
  // המשתמש יהיה super admin רק אם הוא המשתמש המורשה AND הפרופיל שלו מוגדר כ super_admin
  const isSuperAdmin = isAuthorizedSuperUser && profile?.role === 'super_admin';
  
  return {
    isSuperAdmin,
    loading
  };
}
