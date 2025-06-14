
// Extended interface for the joined query result
export interface BusinessSubscriptionWithDetails {
  id: string;
  business_id: string;
  plan_id: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  subscription_plans: {
    name: string;
    plan_type: string;
    billing_cycle: string;
  };
  businesses: {
    name: string;
  };
}

export const getPlanTypeColor = (planType: string) => {
  switch (planType) {
    case 'basic':
      return 'bg-blue-100 text-blue-800';
    case 'intermediate':
      return 'bg-orange-100 text-orange-800';
    case 'full':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getBillingCycleColor = (cycle: string) => {
  switch (cycle) {
    case 'monthly':
      return 'bg-green-100 text-green-800';
    case 'yearly':
      return 'bg-blue-100 text-blue-800';
    case 'trial':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getBillingCycleLabel = (cycle: string) => {
  switch (cycle) {
    case 'monthly':
      return 'חודשי';
    case 'yearly':
      return 'שנתי';
    case 'trial':
      return 'ניסיון';
    default:
      return cycle;
  }
};
