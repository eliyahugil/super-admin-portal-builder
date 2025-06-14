
import React from 'react';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { SubscriptionManagementHeader } from './subscription-management/SubscriptionManagementHeader';
import { SubscriptionPlansOverview } from './subscription-management/SubscriptionPlansOverview';
import { ActiveBusinessSubscriptions } from './subscription-management/ActiveBusinessSubscriptions';

export const SubscriptionManagement: React.FC = () => {
  const { isLoading: isLoadingPlans } = useSubscriptionPlans();

  if (isLoadingPlans) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <SubscriptionManagementHeader />
      <SubscriptionPlansOverview />
      <ActiveBusinessSubscriptions />
    </div>
  );
};
