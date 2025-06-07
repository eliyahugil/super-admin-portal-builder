
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from './useCurrentBusiness';

interface BusinessModule {
  module_key: string;
  is_enabled: boolean;
  module_name: string;
  description: string;
  icon: string;
  route_pattern: string;
}

export function useBusinessModules(businessId?: string) {
  const { businessId: currentBusinessId } = useCurrentBusiness();
  const effectiveBusinessId = businessId || currentBusinessId;

  const { data: modules, isLoading, error } = useQuery({
    queryKey: ['business-modules', effectiveBusinessId],
    queryFn: async () => {
      if (!effectiveBusinessId) return [];

      const { data, error } = await supabase.rpc('get_business_modules', {
        business_id_param: effectiveBusinessId
      });

      if (error) {
        console.error('Error fetching business modules:', error);
        throw error;
      }

      return (data as BusinessModule[]) || [];
    },
    enabled: !!effectiveBusinessId,
  });

  const isModuleEnabled = (moduleKey: string): boolean => {
    if (!modules) return false;
    const module = modules.find(m => m.module_key === moduleKey);
    return module?.is_enabled || false;
  };

  const getEnabledModules = (): BusinessModule[] => {
    return modules?.filter(m => m.is_enabled) || [];
  };

  return {
    modules: modules || [],
    isLoading,
    error,
    isModuleEnabled,
    getEnabledModules,
  };
}
