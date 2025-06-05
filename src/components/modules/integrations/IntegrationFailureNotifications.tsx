
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, X, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface IntegrationFailureNotificationsProps {
  businessId: string;
}

interface FailurePattern {
  integration_name: string;
  failure_count: number;
  last_failure: string;
  error_message: string;
}

export const IntegrationFailureNotifications: React.FC<IntegrationFailureNotificationsProps> = ({
  businessId,
}) => {
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  const { data: failurePatterns, isLoading } = useQuery({
    queryKey: ['integration-failure-patterns', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      // Get integration logs with failures in the last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data, error } = await supabase
        .from('integration_logs')
        .select('integration_name, error_message, created_at')
        .eq('business_id', businessId)
        .eq('status', 'error')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching failure patterns:', error);
        throw error;
      }

      // Group failures by integration and count them
      const failureMap = new Map<string, FailurePattern>();
      
      data?.forEach((log) => {
        const key = log.integration_name;
        if (failureMap.has(key)) {
          const existing = failureMap.get(key)!;
          existing.failure_count++;
          if (new Date(log.created_at) > new Date(existing.last_failure)) {
            existing.last_failure = log.created_at;
            existing.error_message = log.error_message || 'שגיאה לא ידועה';
          }
        } else {
          failureMap.set(key, {
            integration_name: log.integration_name,
            failure_count: 1,
            last_failure: log.created_at,
            error_message: log.error_message || 'שגיאה לא ידועה',
          });
        }
      });

      // Filter to only show patterns with 3+ failures
      return Array.from(failureMap.values()).filter(pattern => pattern.failure_count >= 3);
    },
    enabled: !!businessId,
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const handleDismissNotification = (integrationName: string) => {
    setDismissedNotifications(prev => new Set([...prev, integrationName]));
  };

  const visibleFailures = failurePatterns?.filter(
    pattern => !dismissedNotifications.has(pattern.integration_name)
  ) || [];

  if (isLoading || visibleFailures.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Bell className="h-5 w-5" />
          התראות כשלים חוזרים
        </CardTitle>
        <CardDescription className="text-orange-700">
          אינטגרציות עם כשלים חוזרים ב-24 השעות האחרונות
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleFailures.map((pattern) => (
            <Alert key={pattern.integration_name} className="border-orange-200">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{pattern.integration_name}</span>
                    <Badge variant="destructive" className="text-xs">
                      {pattern.failure_count} כשלים
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    שגיאה אחרונה: {pattern.error_message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(pattern.last_failure).toLocaleString('he-IL')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      // Navigate to integration settings - you can implement this
                      console.log('Navigate to integration settings:', pattern.integration_name);
                    }}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    בדוק הגדרות
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissNotification(pattern.integration_name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
