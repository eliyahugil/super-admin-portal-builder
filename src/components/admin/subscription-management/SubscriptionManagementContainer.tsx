
import React from 'react';
import { SubscriptionManagementHeader } from './SubscriptionManagementHeader';
import { SubscriptionPlansOverview } from './SubscriptionPlansOverview';
import { ActiveBusinessSubscriptions } from './ActiveBusinessSubscriptions';

export const SubscriptionManagementContainer: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <SubscriptionManagementHeader />
      <SubscriptionPlansOverview />
      <ActiveBusinessSubscriptions />
    </div>
  );
};
