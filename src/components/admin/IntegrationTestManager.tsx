
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock,
  AlertTriangle 
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BusinessIntegrationWithBusiness {
  id: string;
  business_id: string;
  integration_name: string;
  display_name: string;
  is_active: boolean;
  last_sync: string | null;
  last_tested_at: string | null;
  created_at: string;
  business_name: string;
}

export const IntegrationTestManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testingIntegrations, setTestingIntegrations] = useState<Set<string>>(new Set());

  const { data: businessIntegrations, isLoading } = useQuery({
    queryKey: ['business-integrations-with-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_integrations')
        .select(`
          *,
          businesses!inner(name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching business integrations:', error);
        throw error;
      }

      return data.map(item => ({
        ...item,
        business_name: item.businesses?.name || 'Unknown Business'
      })) as BusinessIntegrationWithBusiness[];
    },
  });

  const testIntegration = useMutation({
    mutationFn: async (integrationId: string) => {
      // Simulate integration testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update last_tested_at timestamp
      const { error } = await supabase
        .from('business_integrations')
        .update({ 
          last_tested_at: new Date().toISOString() 
        })
        .eq('id', integrationId);

      if (error) throw error;
      
      return { success: true };
    },
    onMutate: (integrationId) => {
      setTestingIntegrations(prev => new Set([...prev, integrationId]));
    },
    onSuccess: (_, integrationId) => {
      queryClient.invalidateQueries({ queryKey: ['business-integrations-with-businesses'] });
      toast({
        title: 'הצלחה',
        description: 'האינטגרציה נבדקה בהצלחה',
      });
    },
    onError: (error, integrationId) => {
      console.error('Error testing integration:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לבדוק את האינטגרציה',
        variant: 'destructive',
      });
    },
    onSettled: (_, __, integrationId) => {
      setTestingIntegrations(prev => {
        const next = new Set(prev);
        next.delete(integrationId);
        return next;
      });
    },
  });

  const getTestStatusBadge = (integration: BusinessIntegrationWithBusiness) => {
    if (testingIntegrations.has(integration.id)) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          בודק...
        </Badge>
      );
    }

    if (!integration.last_tested_at) {
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          לא נבדק
        </Badge>
      );
    }

    const lastTested = new Date(integration.last_tested_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastTested.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return (
        <Badge variant="default" className="gap-1 bg-green-500">
          <CheckCircle className="h-3 w-3" />
          תקין
        </Badge>
      );
    } else if (hoursDiff < 168) { // 7 days
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          ישן
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          לא עודכן
        </Badge>
      );
    }
  };

  const formatLastTested = (timestamp: string | null) => {
    if (!timestamp) return 'לא נבדק מעולם';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `לפני ${diffInMinutes} דקות`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `לפני ${hours} שעות`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `לפני ${days} ימים`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>בדיקת אינטגרציות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          בדיקת אינטגרציות
        </CardTitle>
        <CardDescription>
          בדוק את מצב האינטגרציות הפעילות במערכת
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!businessIntegrations?.length ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">אין אינטגרציות פעילות למערכת</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>עסק</TableHead>
                <TableHead>אינטגרציה</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>נבדק לאחרונה</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businessIntegrations.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell className="font-medium">
                    {integration.business_name}
                  </TableCell>
                  <TableCell>{integration.display_name}</TableCell>
                  <TableCell>
                    {getTestStatusBadge(integration)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatLastTested(integration.last_tested_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testIntegration.mutate(integration.id)}
                      disabled={testingIntegrations.has(integration.id)}
                    >
                      {testingIntegrations.has(integration.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                      בדוק עכשיו
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
