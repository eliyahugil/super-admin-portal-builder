
import { useAuth } from '@/components/auth/AuthContext';

export function useIsSuperAdmin() {
  const { profile, loading } = useAuth();
  
  const isSuperAdmin = profile?.role === 'super_admin';
  
  return {
    isSuperAdmin,
    loading
  };
}
