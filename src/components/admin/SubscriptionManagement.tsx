
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Plus, Users, Calendar, Settings } from 'lucide-react';

// Extended interface for the joined query result
interface BusinessSubscriptionWithDetails {
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

export const SubscriptionManagement: React.FC = () => {
  const { plans, isLoading: isLoadingPlans, getModulesForPlan } = useSubscriptionPlans();
  
  const { data: businessSubscriptions = [], isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['business-subscriptions'],
    queryFn: async (): Promise<BusinessSubscriptionWithDetails[]> => {
      const { data, error } = await supabase
        .from('business_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            plan_type,
            billing_cycle
          ),
          businesses (
            name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const getPlanTypeColor = (planType: string) => {
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

  const getBillingCycleColor = (cycle: string) => {
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

  if (isLoadingPlans || isLoadingSubscriptions) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Crown className="h-8 w-8" />
          ניהול מנויים ותוכניות
        </h1>
        <p className="text-gray-600 mt-2">נהל תוכניות מנוי ומנויי עסקים</p>
      </div>

      {/* Subscription Plans Overview */}
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

      {/* Active Business Subscriptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                מנויי עסקים פעילים ({businessSubscriptions.length})
              </CardTitle>
              <CardDescription>
                עסקים עם מנויים פעילים במערכת
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              הוסף מנוי
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {businessSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין מנויים פעילים</h3>
              <p className="text-gray-600">לא נמצאו מנויי עסקים פעילים במערכת</p>
            </div>
          ) : (
            <div className="space-y-4">
              {businessSubscriptions.map((subscription) => (
                <Card key={subscription.id} className="border">
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
