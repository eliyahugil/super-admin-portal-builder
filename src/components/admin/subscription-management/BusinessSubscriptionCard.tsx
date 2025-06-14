
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BusinessSubscriptionWithDetails, getPlanTypeColor, getBillingCycleColor, getBillingCycleLabel } from './types';

interface BusinessSubscriptionCardProps {
  subscription: BusinessSubscriptionWithDetails;
}

export const BusinessSubscriptionCard: React.FC<BusinessSubscriptionCardProps> = ({
  subscription
}) => {
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {subscription.businesses?.name || 'עסק לא מזוהה'}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={getPlanTypeColor(subscription.subscription_plans?.plan_type || '')}>
                {subscription.subscription_plans?.name || 'תוכנית לא מזוהה'}
              </Badge>
              <Badge className={getBillingCycleColor(subscription.subscription_plans?.billing_cycle || '')}>
                {getBillingCycleLabel(subscription.subscription_plans?.billing_cycle || '')}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              תאריך התחלה: {new Date(subscription.start_date).toLocaleDateString('he-IL')}
              {subscription.end_date && (
                <> • תאריך סיום: {new Date(subscription.end_date).toLocaleDateString('he-IL')}</>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              ערוך
            </Button>
            <Button variant="outline" size="sm">
              הצג פרטים
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
