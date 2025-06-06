
import { useModuleConfig } from '@/hooks/useModuleConfig';

export const useBusinessModuleEnabled = () => {
  const {
    businessModuleConfigs,
    moduleConfigs,
    isLoading,
  } = useModuleConfig();

  const isModuleEnabled = (moduleKey: string): boolean => {
    if (isLoading) return false;
    
    const businessConfig = businessModuleConfigs?.find(
      config => config.module_key === moduleKey
    );
    
    if (!businessConfig) {
      const moduleConfig = moduleConfigs?.find(m => m.module_key === moduleKey);
      return moduleConfig?.default_visible || false;
    }
    
    return businessConfig.is_enabled;
  };

  const getEnabledModules = (): string[] => {
    if (isLoading || !businessModuleConfigs || !moduleConfigs) return [];
    
    return moduleConfigs
      .filter(module => {
        const businessConfig = businessModuleConfigs.find(
          config => config.module_key === module.module_key
        );
        
        if (!businessConfig) {
          return module.default_visible;
        }
        
        return businessConfig.is_enabled;
      })
      .map(module => module.module_key);
  };

  return {
    isModuleEnabled,
    getEnabledModules,
    isLoading,
  };
};
