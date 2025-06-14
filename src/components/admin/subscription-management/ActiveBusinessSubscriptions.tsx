
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BusinessSubscriptionCard } from './BusinessSubscriptionCard';
import { BusinessSubscriptionWithDetails } from './types';

export const ActiveBusinessSubscriptions: React.FC = () => {
  const { data: businessSubscriptions = [], isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
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
              <BusinessSubscriptionCard
                key={subscription.id}
                subscription={subscription}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
