
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface IntegrationStatus {
  name: string;
  displayName: string;
  status: 'active' | 'inactive' | 'error' | 'checking';
  lastCheck: string;
  responseTime?: number;
  errorMessage?: string;
  businesses_connected: number;
}

export const IntegrationStatusMonitor: React.FC = () => {
  const { data: statusData, isLoading, refetch } = useQuery({
    queryKey: ['integration-status'],
    queryFn: async () => {
      // Mock data for now - this would be real API status checks
      const mockData: IntegrationStatus[] = [
        {
          name: 'google_maps',
          displayName: 'Google Maps',
          status: 'active',
          lastCheck: new Date().toISOString(),
          responseTime: 250,
          businesses_connected: 15
        },
        {
          name: 'whatsapp_business',
          displayName: 'WhatsApp Business',
          status: 'active',
          lastCheck: new Date().toISOString(),
          responseTime: 180,
          businesses_connected: 8
        },
        {
          name: 'facebook_leads',
          displayName: 'Facebook Leads',
          status: 'error',
          lastCheck: new Date().toISOString(),
          errorMessage: 'API key expired',
          businesses_connected: 3
        },
        {
          name: 'green_invoice',
          displayName: 'Green Invoice',
          status: 'inactive',
          lastCheck: new Date(Date.now() - 3600000).toISOString(),
          businesses_connected: 0
        }
      ];
      
      return mockData;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">פעיל</Badge>;
      case 'error':
        return <Badge variant="destructive">שגיאה</Badge>;
      case 'checking':
        return <Badge className="bg-yellow-100 text-yellow-800">בודק</Badge>;
      default:
        return <Badge variant="secondary">לא פעיל</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">טוען נתוני סטטוס...</span>
          </div>
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
              <Activity className="h-5 w-5" />
              מוניטור סטטוס אינטגרציות
            </CardTitle>
            <CardDescription>
              מעקב אחר תקינות ותגובה של כל האינטגרציות במערכת
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            רענן
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusData?.map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                {getStatusIcon(integration.status)}
                <div>
                  <h3 className="font-medium">{integration.displayName}</h3>
                  <p className="text-sm text-gray-500">
                    בדיקה אחרונה: {new Date(integration.lastCheck).toLocaleString('he-IL')}
                  </p>
                  {integration.errorMessage && (
                    <p className="text-sm text-red-600">{integration.errorMessage}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-sm font-medium">{integration.businesses_connected}</p>
                  <p className="text-xs text-gray-500">עסקים מחוברים</p>
                </div>
                
                {integration.responseTime && (
                  <div className="text-center">
                    <p className="text-sm font-medium">{integration.responseTime}ms</p>
                    <p className="text-xs text-gray-500">זמן תגובה</p>
                  </div>
                )}

                {getStatusBadge(integration.status)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">סיכום מערכת</h4>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {statusData?.filter(i => i.status === 'active').length || 0}
              </p>
              <p className="text-sm text-gray-600">פעילות</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {statusData?.filter(i => i.status === 'error').length || 0}
              </p>
              <p className="text-sm text-gray-600">שגיאות</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">
                {statusData?.filter(i => i.status === 'inactive').length || 0}
              </p>
              <p className="text-sm text-gray-600">לא פעילות</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {statusData?.reduce((sum, i) => sum + i.businesses_connected, 0) || 0}
              </p>
              <p className="text-sm text-gray-600">סה"כ חיבורים</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
