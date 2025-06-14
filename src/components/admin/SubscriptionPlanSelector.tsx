
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { Crown, Calendar, Clock, Zap } from 'lucide-react';
import { SubscriptionPlan } from '@/types/subscription';

interface SubscriptionPlanSelectorProps {
  selectedPlanId: string;
  onPlanSelect: (planId: string) => void;
}

export const SubscriptionPlanSelector: React.FC<SubscriptionPlanSelectorProps> = ({
  selectedPlanId,
  onPlanSelect,
}) => {
  const { plans, isLoading, getModulesForPlan } = useSubscriptionPlans();

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'basic':
        return <Clock className="h-5 w-5" />;
      case 'intermediate':
        return <Zap className="h-5 w-5" />;
      case 'full':
        return <Crown className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'basic':
        return 'border-blue-200 bg-blue-50';
      case 'intermediate':
        return 'border-orange-200 bg-orange-50';
      case 'full':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getBillingCycleLabel = (cycle: string) => {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>טוען תוכניות מנוי...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          בחירת תוכנית מנוי
        </CardTitle>
        <CardDescription>
          בחר תוכנית מנוי עבור העסק החדש
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedPlanId} onValueChange={onPlanSelect}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const moduleCount = getModulesForPlan(plan.id).length;
              return (
                <div key={plan.id} className="relative">
                  <RadioGroupItem
                    value={plan.id}
                    id={plan.id}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={plan.id}
                    className={`cursor-pointer block p-4 border-2 rounded-lg transition-all ${
                      selectedPlanId === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${getPlanColor(plan.plan_type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getPlanIcon(plan.plan_type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        {plan.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {plan.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="secondary" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {getBillingCycleLabel(plan.billing_cycle)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {moduleCount} מודולים
                          </Badge>
                          {plan.billing_cycle === 'trial' && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              ללא עלות
                            </Badge>
                          )}
                        </div>

                        {plan.duration_months && (
                          <p className="text-xs text-gray-500 mt-2">
                            משך: {plan.duration_months} חודשים
                          </p>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>

        {selectedPlanId && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">מודולים כלולים בתוכנית:</h4>
            <div className="flex flex-wrap gap-2">
              {getModulesForPlan(selectedPlanId).map((moduleKey) => (
                <Badge key={moduleKey} variant="secondary" className="text-xs">
                  {moduleKey}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
