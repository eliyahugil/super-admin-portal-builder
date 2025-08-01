
import { useAuth } from '@/components/auth/AuthContext';

export function useIsSuperAdmin() {
  const { user, profile, loading } = useAuth();
  
  // Use database-driven role checking - no hardcoded emails
  const isSuperAdmin = Boolean(profile?.role === 'super_admin');
  
  return {
    isSuperAdmin,
    loading
  };
}
