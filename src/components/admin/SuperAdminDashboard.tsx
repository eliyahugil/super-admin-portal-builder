
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { SuperAdminHeader } from './dashboard/SuperAdminHeader';
import { SuperAdminStats } from './dashboard/SuperAdminStats';
import { SuperAdminQuickActions } from './dashboard/SuperAdminQuickActions';
import { SuperAdminSystemAlerts } from './dashboard/SuperAdminSystemAlerts';
import { SuperAdminRecentActivity } from './dashboard/SuperAdminRecentActivity';
import { SuperAdminModulesManagement } from './dashboard/SuperAdminModulesManagement';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const SuperAdminDashboard: React.FC = () => {
  const { profile, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get businesses
  const { data: businesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isSuperAdmin,
  });

  // Get module configurations
  const { data: moduleConfigs = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['admin-module-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules_config')
        .select('*')
        .order('module_name');

      if (error) throw error;
      return data || [];
    },
    enabled: isSuperAdmin,
  });

  // Get business modules
  const { data: businessModules = [], isLoading: businessModulesLoading } = useQuery({
    queryKey: ['admin-business-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_module_config')
        .select('*');

      if (error) throw error;
      return data || [];
    },
    enabled: isSuperAdmin,
  });

  // Toggle module mutation
  const toggleModuleMutation = useMutation({
    mutationFn: async ({ businessId, moduleKey }: { businessId: string; moduleKey: string }) => {
      const existingConfig = businessModules.find(
        bm => bm.business_id === businessId && bm.module_key === moduleKey
      );

      if (existingConfig) {
        const { error } = await supabase
          .from('business_module_config')
          .update({ is_enabled: !existingConfig.is_enabled })
          .eq('id', existingConfig.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_module_config')
          .insert({
            business_id: businessId,
            module_key: moduleKey,
            is_enabled: true
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-business-modules'] });
      toast({
        title: 'הצלחה',
        description: 'הגדרות המודול עודכנו',
      });
    },
    onError: (error: any) => {
      console.error('Error toggling module:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את הגדרות המודול',
        variant: 'destructive',
      });
    }
  });

  const isModuleEnabled = (businessId: string, moduleKey: string) => {
    const config = businessModules.find(
      bm => bm.business_id === businessId && bm.module_key === moduleKey
    );
    return config?.is_enabled || false;
  };

  const handleToggleModule = (businessId: string, moduleKey: string) => {
    toggleModuleMutation.mutate({ businessId, moduleKey });
  };

  const systemStats = {
    totalBusinesses: businesses.length,
    activeBusinesses: businesses.filter(b => b.is_active).length,
    totalUsers: 0, // This would need a separate query
    activeModules: moduleConfigs.length,
    pendingApprovals: 0, // This would need a separate query
    systemHealth: 100
  };

  if (!isSuperAdmin) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">אין הרשאה</h2>
        <p className="text-gray-600">אין לך הרשאות מנהל ראשי</p>
      </div>
    );
  }

  if (businessesLoading || modulesLoading || businessModulesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <SuperAdminHeader />
      
      <SuperAdminStats systemStats={systemStats} />
      
      <SuperAdminQuickActions systemStats={systemStats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <SuperAdminSystemAlerts pendingApprovals={systemStats.pendingApprovals} />
        <SuperAdminRecentActivity />
      </div>

      <SuperAdminModulesManagement
        businesses={businesses}
        moduleConfigs={moduleConfigs}
        businessModules={businessModules}
        isModuleEnabled={isModuleEnabled}
        handleToggleModule={handleToggleModule}
        toggleModuleMutation={toggleModuleMutation}
      />
    </div>
  );
};
