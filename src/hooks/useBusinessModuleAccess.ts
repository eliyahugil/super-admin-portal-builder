
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from './useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';

interface BusinessModuleAccess {
  moduleKey: string;
  isEnabled: boolean;
  hasAccess: boolean;
}

/**
 * Hook to check if current user has access to specific business modules
 * Enforces business-specific module access and user roles
 */
export function useBusinessModuleAccess() {
  const { profile } = useAuth();
  const { businessId, isSuperAdmin } = useCurrentBusiness();

  const { data: moduleAccess = [], isLoading } = useQuery({
    queryKey: ['business-module-access', businessId, profile?.id],
    queryFn: async (): Promise<BusinessModuleAccess[]> => {
      if (!businessId || !profile) return [];

      // Super admins have access to all modules
      if (isSuperAdmin) {
        console.log('useBusinessModuleAccess - Super admin detected, granting all access');
        
        const { data: allModules, error } = await supabase
          .from('modules_config')
          .select('module_key')
          .eq('enabled_by_superadmin', true);

        if (error) throw error;

        return allModules?.map(module => ({
          moduleKey: module.module_key,
          isEnabled: true,
          hasAccess: true
        })) || [];
      }

      // Regular users: check business_module_config for enabled modules
      console.log(`useBusinessModuleAccess - Checking module access for business: ${businessId}`);
      
      const { data, error } = await supabase
        .from('business_module_config')
        .select(`
          module_key,
          is_enabled,
          modules_config!inner(
            enabled_by_superadmin,
            minimum_role
          )
        `)
        .eq('business_id', businessId)
        .eq('modules_config.enabled_by_superadmin', true);

      if (error) {
        console.error('useBusinessModuleAccess - Error fetching module access:', error);
        throw error;
      }

      const moduleAccess = data?.map(item => {
        const minimumRole = (item as any).modules_config?.minimum_role || 'business_user';
        const userRole = profile.role || 'business_user';
        
        // Simple role hierarchy check
        const roleHierarchy = {
          'business_user': 1,
          'business_admin': 2,
          'super_admin': 3
        };
        
        const hasRoleAccess = (roleHierarchy[userRole as keyof typeof roleHierarchy] || 0) >= 
                             (roleHierarchy[minimumRole as keyof typeof roleHierarchy] || 0);

        return {
          moduleKey: item.module_key,
          isEnabled: item.is_enabled,
          hasAccess: item.is_enabled && hasRoleAccess
        };
      }) || [];

      console.log(`useBusinessModuleAccess - Module access calculated:`, moduleAccess);
      return moduleAccess;
    },
    enabled: !!profile && (!!businessId || isSuperAdmin),
  });

  const hasModuleAccess = (moduleKey: string): boolean => {
    if (isSuperAdmin) return true;
    
    const access = moduleAccess.find(m => m.moduleKey === moduleKey);
    return access?.hasAccess || false;
  };

  const getEnabledModules = (): string[] => {
    return moduleAccess
      .filter(m => m.hasAccess)
      .map(m => m.moduleKey);
  };

  return {
    moduleAccess,
    hasModuleAccess,
    getEnabledModules,
    isLoading,
    isSuperAdmin
  };
}
