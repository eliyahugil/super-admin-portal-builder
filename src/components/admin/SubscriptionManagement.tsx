
import React from 'react';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { 
  SubscriptionManagementLoading, 
  SubscriptionManagementContainer 
} from './subscription-management';

export const SubscriptionManagement: React.FC = () => {
  const { isLoading: isLoadingPlans } = useSubscriptionPlans();

  if (isLoadingPlans) {
    return <SubscriptionManagementLoading />;
  }

  return <SubscriptionManagementContainer />;
};
