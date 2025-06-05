
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { googleMapsService } from '@/services/GoogleMapsService';

interface IntegrationStatus {
  id: string;
  integration_name: string;
  display_name: string;
  is_active: boolean;
  last_tested_at: string | null;
  config: Record<string, any>;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  message?: string;
}

export const IntegrationStatusMonitor: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const { toast } = useToast();

  console.log('=== IntegrationStatusMonitor RENDER ===');

  const { data: integrations, isLoading, refetch } = useQuery({
    queryKey: ['integration-status'],
    queryFn: async () => {
      console.log('=== FETCHING INTEGRATION STATUS ===');
      
      const { data, error } = await supabase
        .from('global_integrations')
        .select('*')
        .order('integration_name');

      if (error) {
        console.error('Error fetching integration status:', error);
        throw error;
      }

      console.log('Raw integration data:', data);

      // Transform the data and determine status
      const statusData: IntegrationStatus[] = data.map(integration => {
        let status: IntegrationStatus['status'] = 'unknown';
        let message = '';

        // Safely cast config to Record<string, any>
        const config = (integration.config && typeof integration.config === 'object' && !Array.isArray(integration.config)) 
          ? integration.config as Record<string, any>
          : {};

        const last_tested_at = integration.last_tested_at;

        if (!integration.is_active) {
          status = 'warning';
          message = 'אינטגרציה מושבתת';
        } else if (config && Object.keys(config).length > 0) {
          // Check if required config exists
          switch (integration.integration_name) {
            case 'google_maps':
            case 'maps':
            case 'GOOGLE_MAPS':
              if (config.api_key) {
                status = last_tested_at ? 'healthy' : 'warning';
                message = last_tested_at ? 'תקין' : 'טרם נבדק - לחץ "בדוק חיבור"';
              } else {
                status = 'error';
                message = 'חסר API Key';
              }
              break;
            case 'whatsapp':
              if (config.access_token && config.phone_number_id) {
                status = last_tested_at ? 'healthy' : 'warning';
                message = last_tested_at ? 'תקין' : 'טרם נבדק - לחץ "בדוק חיבור"';
              } else {
                status = 'error';
                message = 'חסרים פרטי התחברות';
              }
              break;
            default:
              if (config.api_key) {
                status = last_tested_at ? 'healthy' : 'warning';
                message = last_tested_at ? 'תקין' : 'טרם נבדק - לחץ "בדוק חיבור"';
              } else {
                status = 'error';
                message = 'חסר API Key';
              }
          }
        } else {
          status = 'error';
          message = 'לא מוגדר';
        }

        return {
          id: integration.id,
          integration_name: integration.integration_name,
          display_name: integration.display_name,
          is_active: integration.is_active,
          last_tested_at,
          config,
          status,
          message
        };
      });

      console.log('Processed status data:', statusData);
      return statusData;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const testIntegrationConnection = async (integration: IntegrationStatus) => {
    console.log('=== TESTING INTEGRATION CONNECTION ===');
    console.log('Integration:', integration.integration_name);
    console.log('Config:', integration.config);
    
    try {
      let testResult = false;
      let errorMessage = '';

      switch (integration.integration_name) {
        case 'google_maps':
        case 'maps':
        case 'GOOGLE_MAPS':
          console.log('Testing Google Maps integration...');
          if (integration.config.api_key) {
            // Set the API key temporarily for testing
            googleMapsService.setApiKey(integration.config.api_key);
            testResult = await googleMapsService.testConnection();
            if (!testResult) {
              errorMessage = 'חיבור ל-Google Maps נכשל';
            }
          } else {
            errorMessage = 'חסר API Key ל-Google Maps';
          }
          break;

        case 'whatsapp':
          console.log('Testing WhatsApp integration...');
          if (integration.config.access_token && integration.config.phone_number_id) {
            try {
              const response = await fetch(
                `https://graph.facebook.com/v18.0/${integration.config.phone_number_id}/whatsapp_business_profile`,
                {
                  headers: {
                    Authorization: `Bearer ${integration.config.access_token}`,
                  },
                }
              );
              testResult = response.ok;
              if (!testResult) {
                errorMessage = 'חיבור ל-WhatsApp נכשל - בדוק את פרטי ההתחברות';
              }
            } catch (error) {
              console.error('WhatsApp test error:', error);
              errorMessage = 'שגיאה בבדיקת חיבור WhatsApp';
            }
          } else {
            errorMessage = 'חסרים פרטי התחברות ל-WhatsApp';
          }
          break;

        default:
          // For other integrations, just check if config exists
          testResult = integration.config && Object.keys(integration.config).length > 0;
          if (!testResult) {
            errorMessage = 'חסרה הגדרה עבור האינטגרציה';
          }
      }

      console.log('Test result:', testResult);
      
      if (testResult) {
        return { success: true, message: 'החיבור תקין' };
      } else {
        return { success: false, message: errorMessage || 'בדיקת החיבור נכשלה' };
      }

    } catch (error: any) {
      console.error('Integration test error:', error);
      return { success: false, message: error.message || 'שגיאה בבדיקת החיבור' };
    }
  };

  const testIntegration = async (integration: IntegrationStatus) => {
    console.log('=== TESTING INTEGRATION ===');
    console.log('Integration:', integration.integration_name);
    
    setTesting(integration.id);
    
    try {
      // Test the actual integration
      const testResult = await testIntegrationConnection(integration);
      console.log('Integration test result:', testResult);

      // Update the last_tested_at field in the database
      const { error } = await supabase
        .from('global_integrations')
        .update({ 
          last_tested_at: new Date().toISOString() 
        })
        .eq('id', integration.id);

      if (error) {
        console.error('Error updating last_tested_at:', error);
        throw error;
      }

      console.log('Successfully updated last_tested_at');
      
      toast({
        title: testResult.success ? 'הצלחה' : 'שגיאה',
        description: `${integration.display_name}: ${testResult.message}`,
        variant: testResult.success ? 'default' : 'destructive',
      });

      // Refresh the data to show updated status
      await refetch();
      
    } catch (error) {
      console.error('Error testing integration:', error);
      toast({
        title: 'שגיאה',
        description: `שגיאה בבדיקת ${integration.display_name}`,
        variant: 'destructive',
      });
    } finally {
      setTesting(null);
    }
  };

  const handleRefresh = async () => {
    console.log('=== MANUAL REFRESH TRIGGERED ===');
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusIcon = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800 border-green-200">תקין</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">אזהרה</Badge>;
      case 'error':
        return <Badge variant="destructive">שגיאה</Badge>;
      default:
        return <Badge variant="secondary">לא ידוע</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>מוניטור סטטוס אינטגרציות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">טוען סטטוס אינטגרציות...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthyCount = integrations?.filter(i => i.status === 'healthy').length || 0;
  const warningCount = integrations?.filter(i => i.status === 'warning').length || 0;
  const errorCount = integrations?.filter(i => i.status === 'error').length || 0;
  const totalCount = integrations?.length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>מוניטור סטטוס אינטגרציות</CardTitle>
            <CardDescription>מעקב בזמן אמת אחר סטטוס האינטגרציות הגלובליות</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
            רענן
          </Button>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
              <div className="text-sm text-gray-500">סה"כ אינטגרציות</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
              <div className="text-sm text-gray-500">תקינות</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-gray-500">אזהרות</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-500">שגיאות</div>
            </div>
          </div>

          {/* Integration Details */}
          <div className="space-y-4">
            {integrations?.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(integration.status)}
                  <div>
                    <h4 className="font-medium">{integration.display_name}</h4>
                    <p className="text-sm text-gray-500">
                      {integration.integration_name}
                      {integration.last_tested_at && (
                        <span className="ml-2">
                          • נבדק לאחרונה: {new Date(integration.last_tested_at).toLocaleDateString('he-IL')} {new Date(integration.last_tested_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testIntegration(integration)}
                    disabled={testing === integration.id || !integration.is_active}
                    className="flex items-center gap-2"
                  >
                    {testing === integration.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    {testing === integration.id ? 'בודק...' : 'בדוק חיבור'}
                  </Button>
                  
                  {getStatusBadge(integration.status)}
                  {integration.message && (
                    <span className="text-sm text-gray-600">{integration.message}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!integrations?.length && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">לא נמצאו אינטגרציות מוגדרות</p>
              <p className="text-sm text-gray-400">הוסף אינטגרציות בלשונית "אינטגרציות גלובליות"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
