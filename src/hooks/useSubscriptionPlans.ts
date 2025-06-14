
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan, PlanModulePermission } from '@/types/subscription';

export const useSubscriptionPlans = () => {
  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('plan_type, billing_cycle');

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      return (data || []).map(plan => ({
        ...plan,
        plan_type: plan.plan_type as 'basic' | 'intermediate' | 'full',
        billing_cycle: plan.billing_cycle as 'monthly' | 'yearly' | 'trial'
      }));
    },
  });

  const { data: planPermissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['plan-module-permissions'],
    queryFn: async (): Promise<PlanModulePermission[]> => {
      const { data, error } = await supabase
        .from('plan_module_permissions')
        .select('*');

      if (error) throw error;
      return data || [];
    },
  });

  const getModulesForPlan = (planId: string): string[] => {
    return planPermissions
      .filter(p => p.plan_id === planId && p.is_included)
      .map(p => p.module_key);
  };

  return {
    plans,
    planPermissions,
    isLoading: isLoading || isLoadingPermissions,
    error,
    getModulesForPlan,
  };
};
