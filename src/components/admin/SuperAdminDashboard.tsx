
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SuperAdminStats } from './dashboard/SuperAdminStats';
import { SuperAdminQuickActions } from './dashboard/SuperAdminQuickActions';
import { SuperAdminModulesManagement } from './dashboard/SuperAdminModulesManagement';
import { SuperAdminHeader } from './dashboard/SuperAdminHeader';

export const SuperAdminDashboard: React.FC = () => {
  const { profile, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  console.log('SuperAdminDashboard - Profile state:', {
    profile,
    isSuperAdmin
  });

  // Fetch businesses
  const { data: businesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ['businesses-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching businesses:', error);
        throw error;
      }
      return data || [];
    },
    enabled: isSuperAdmin
  });

  // Fetch modules configuration
  const { data: moduleConfigs = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['modules-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules_config')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching modules config:', error);
        throw error;
      }
      return data || [];
    },
    enabled: isSuperAdmin
  });

  // Fetch business module configurations
  const { data: businessModules = [] } = useQuery({
    queryKey: ['business-modules-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_module_config')
        .select('*');
      
      if (error) {
        console.error('Error fetching business modules:', error);
        return [];
      }
      return data || [];
    },
    enabled: isSuperAdmin
  });

  // Toggle module for business mutation
  const toggleModuleMutation = useMutation({
    mutationFn: async ({ businessId, moduleKey, isEnabled }: {
      businessId: string;
      moduleKey: string;
      isEnabled: boolean;
    }) => {
      console.log('Toggling module:', { businessId, moduleKey, isEnabled });

      // First, validate that the module exists in modules_config
      const { data: moduleExists, error: checkError } = await supabase
        .from('modules_config')
        .select('module_key')
        .eq('module_key', moduleKey)
        .single();

      if (checkError || !moduleExists) {
        console.error('Module does not exist in modules_config:', moduleKey);
        throw new Error(`המודול ${moduleKey} לא קיים במערכת`);
      }

      if (isEnabled) {
        // Enable module
        const { error } = await supabase
          .from('business_module_config')
          .upsert({
            business_id: businessId,
            module_key: moduleKey,
            is_enabled: true,
            enabled_by: profile?.id,
            enabled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'business_id,module_key'
          });

        if (error) throw error;
      } else {
        // Disable module
        const { error } = await supabase
          .from('business_module_config')
          .update({
            is_enabled: false,
            disabled_by: profile?.id,
            disabled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('business_id', businessId)
          .eq('module_key', moduleKey);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-modules-all'] });
      toast({
        title: 'הצלחה',
        description: 'הגדרות המודול עודכנו בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error toggling module:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'שגיאה בעדכון המודול',
        variant: 'destructive',
      });
    },
  });

  const isModuleEnabled = (businessId: string, moduleKey: string) => {
    return businessModules.some(
      bm => bm.business_id === businessId && 
           bm.module_key === moduleKey && 
           bm.is_enabled
    );
  };

  const handleToggleModule = (businessId: string, moduleKey: string) => {
    const isCurrentlyEnabled = isModuleEnabled(businessId, moduleKey);
    toggleModuleMutation.mutate({
      businessId,
      moduleKey,
      isEnabled: !isCurrentlyEnabled
    });
  };

  if (!isSuperAdmin) {
    return <SuperAdminHeader.Unauthorized />;
  }

  if (businessesLoading || modulesLoading) {
    return <SuperAdminHeader.Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SuperAdminHeader profile={profile} />
        
        <SuperAdminStats 
          businesses={businesses}
          moduleConfigs={moduleConfigs}
          businessModules={businessModules}
        />

        <SuperAdminQuickActions navigate={navigate} />

        <SuperAdminModulesManagement
          businesses={businesses}
          moduleConfigs={moduleConfigs}
          businessModules={businessModules}
          isModuleEnabled={isModuleEnabled}
          handleToggleModule={handleToggleModule}
          toggleModuleMutation={toggleModuleMutation}
        />
      </div>
    </div>
  );
};
