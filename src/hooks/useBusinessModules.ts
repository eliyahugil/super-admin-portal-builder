
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';

interface BusinessModule {
  module_key: string;
  is_enabled: boolean;
  module_name: string;
  description: string;
  icon: string;
  route_pattern: string;
}

export const useBusinessModules = () => {
  const { businessId } = useBusiness();

  const { data: businessModules, isLoading, refetch } = useQuery({
    queryKey: ['business-modules', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase.rpc('get_business_modules', {
        business_id_param: businessId
      });

      if (error) {
        console.error('Error fetching business modules:', error);
        throw error;
      }

      return data as BusinessModule[];
    },
    enabled: !!businessId,
  });

  const isModuleEnabled = (moduleKey: string): boolean => {
    if (!businessModules) return false;
    const module = businessModules.find(m => m.module_key === moduleKey);
    return module?.is_enabled || false;
  };

  const getEnabledModules = (): BusinessModule[] => {
    return businessModules?.filter(m => m.is_enabled) || [];
  };

  return {
    businessModules: businessModules || [],
    isLoading,
    refetch,
    isModuleEnabled,
    getEnabledModules,
  };
};
