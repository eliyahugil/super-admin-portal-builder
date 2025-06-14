
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Calendar } from 'lucide-react';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { getPlanTypeColor, getBillingCycleColor, getBillingCycleLabel } from './types';

export const SubscriptionPlansOverview: React.FC = () => {
  const { plans, getModulesForPlan } = useSubscriptionPlans();

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          תוכניות מנוי זמינות
        </CardTitle>
        <CardDescription>
          תוכניות המנוי הזמינות במערכת
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const moduleCount = getModulesForPlan(plan.id).length;
            return (
              <Card key={plan.id} className="border-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge className={getPlanTypeColor(plan.plan_type)}>
                      {plan.plan_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className={getBillingCycleColor(plan.billing_cycle)}>
                      <Calendar className="h-3 w-3 mr-1" />
                      {getBillingCycleLabel(plan.billing_cycle)}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      {moduleCount} מודולים כלולים
                    </div>
                    {plan.description && (
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    )}
                    {plan.duration_months && (
                      <div className="text-xs text-gray-500">
                        משך: {plan.duration_months} חודשים
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
