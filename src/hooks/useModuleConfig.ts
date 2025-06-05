
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import type { ModuleConfig, BusinessModuleConfig } from '@/components/modules/config/ModuleConfigTypes';

export const useModuleConfig = () => {
  const { businessId, isSuperAdmin } = useBusiness();
  const { toast } = useToast();

  // Fetch all modules configuration
  const { 
    data: moduleConfigs, 
    isLoading: isLoadingModules,
    refetch: refetchModules 
  } = useQuery({
    queryKey: ['modules-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules_config')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as ModuleConfig[];
    },
  });

  // Fetch business module configuration
  const { 
    data: businessModuleConfigs, 
    isLoading: isLoadingBusinessModules,
    refetch: refetchBusinessModules 
  } = useQuery({
    queryKey: ['business-module-config', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('business_module_config')
        .select('*')
        .eq('business_id', businessId);

      if (error) throw error;
      return data as BusinessModuleConfig[];
    },
    enabled: !!businessId,
  });

  // Get enabled modules for current business
  const getEnabledModules = () => {
    if (!moduleConfigs || !businessId) return [];

    return moduleConfigs.filter(module => {
      // For super admin - show all modules
      if (isSuperAdmin) return true;

      // Check if module is enabled by super admin
      if (!module.enabled_by_superadmin) return false;

      // Check business-specific configuration
      const businessConfig = businessModuleConfigs?.find(
        config => config.module_key === module.module_key
      );

      // If no business config exists, use default visibility
      if (!businessConfig) {
        return module.default_visible;
      }

      return businessConfig.is_enabled;
    });
  };

  // Get modules by category
  const getModulesByCategory = (category: string) => {
    const enabledModules = getEnabledModules();
    return enabledModules.filter(module => module.category === category);
  };

  // Enable/disable module for business
  const toggleModuleForBusiness = async (moduleKey: string, enabled: boolean) => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const existingConfig = businessModuleConfigs?.find(
        config => config.module_key === moduleKey
      );

      if (existingConfig) {
        // Update existing configuration
        const { error } = await supabase
          .from('business_module_config')
          .update({
            is_enabled: enabled,
            enabled_by: enabled ? (await supabase.auth.getUser()).data.user?.id : null,
            enabled_at: enabled ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingConfig.id);

        if (error) throw error;
      } else {
        // Create new configuration
        const { error } = await supabase
          .from('business_module_config')
          .insert({
            business_id: businessId,
            module_key: moduleKey,
            is_enabled: enabled,
            enabled_by: enabled ? (await supabase.auth.getUser()).data.user?.id : null,
            enabled_at: enabled ? new Date().toISOString() : null,
          });

        if (error) throw error;
      }

      toast({
        title: 'הצלחה',
        description: `המודול ${enabled ? 'הופעל' : 'הושבת'} בהצלחה`,
      });

      refetchBusinessModules();
      return true;
    } catch (error) {
      console.error('Error toggling module:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את המודול',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Generate route for module
  const generateModuleRoute = (module: ModuleConfig): string => {
    if (!businessId) return module.route_pattern;
    
    return module.route_pattern.replace('{businessId}', businessId);
  };

  return {
    moduleConfigs,
    businessModuleConfigs,
    isLoading: isLoadingModules || isLoadingBusinessModules,
    getEnabledModules,
    getModulesByCategory,
    toggleModuleForBusiness,
    generateModuleRoute,
    refetchModules,
    refetchBusinessModules,
  };
};
