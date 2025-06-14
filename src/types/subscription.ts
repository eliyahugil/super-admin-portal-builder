
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  plan_type: 'basic' | 'intermediate' | 'full';
  billing_cycle: 'monthly' | 'yearly' | 'trial';
  duration_months?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanModulePermission {
  id: string;
  plan_id: string;
  module_key: string;
  is_included: boolean;
  usage_limit?: number;
  created_at: string;
}

export interface BusinessSubscription {
  id: string;
  business_id: string;
  plan_id: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  subscription_plans?: SubscriptionPlan;
  businesses?: {
    name: string;
  };
}

export interface BusinessModuleSubscription {
  id: string;
  business_id: string;
  module_key: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  usage_limit?: number;
  current_usage: number;
  subscription_id?: string;
  created_at: string;
  updated_at: string;
}
