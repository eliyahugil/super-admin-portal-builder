
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  MessageSquare, 
  Facebook, 
  FileText, 
  CreditCard,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { IntegrationForm } from '@/components/modules/integrations/IntegrationForm';

export const BusinessIntegrationsManager: React.FC = () => {
  const { businessId, integration } = useParams();
  const { integrations, businessIntegrations, updateIntegration, deleteIntegration, loading } = useIntegrations(businessId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">מחובר</Badge>;
      case 'disconnected':
        return <Badge className="bg-gray-100 text-gray-800">לא מחובר</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">שגיאה</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const handleSaveIntegration = (integrationName: string, values: any) => {
    updateIntegration({ integrationName, values });
  };

  const handleDeleteIntegration = (integrationId: string) => {
    deleteIntegration(integrationId);
  };

  const renderIntegrationDetails = () => {
    if (!integration) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((int) => {
            const businessInt = businessIntegrations.find(bi => bi.integration_name === int.integration_name);
            const status = businessInt?.is_active ? 'connected' : 'disconnected';
            
            return (
              <Card key={int.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{int.icon || '🔗'}</span>
                      <div>
                        <CardTitle className="text-lg">{int.display_name}</CardTitle>
                        <CardDescription>{int.description}</CardDescription>
                      </div>
                    </div>
                    {getStatusIcon(status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(status)}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `/${businessId}/integrations/${int.integration_name}`}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      הגדר
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
    }

    // הצגת הגדרות אינטגרציה ספציפית
    const currentIntegration = integrations.find(int => int.integration_name === integration);
    const currentBusinessIntegration = businessIntegrations.find(bi => bi.integration_name === integration);
    
    if (!currentIntegration) {
      return <div>אינטגרציה לא נמצאה</div>;
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = `/${businessId}/integrations`}
            className="mb-4"
          >
            ← חזור לרשימת אינטגרציות
          </Button>
        </div>

        <IntegrationForm
          integration={currentIntegration}
          businessIntegration={currentBusinessIntegration}
          onSave={(values) => handleSaveIntegration(currentIntegration.integration_name, values)}
          onDelete={currentBusinessIntegration ? handleDeleteIntegration : undefined}
          isLoading={loading}
        />

        {currentBusinessIntegration && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>נתוני שימוש</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="usage" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="usage">שימוש</TabsTrigger>
                  <TabsTrigger value="logs">לוגים</TabsTrigger>
                </TabsList>

                <TabsContent value="usage">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold">1,247</p>
                            <p className="text-sm text-gray-600">שימושים החודש</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold">98.5%</p>
                            <p className="text-sm text-gray-600">זמינות</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold">₪45</p>
                            <p className="text-sm text-gray-600">עלות החודש</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logs">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-sm font-mono">
                        2024-01-20 14:30:25 - בקשת API הצליחה<br/>
                        2024-01-20 14:25:10 - חיבור לאינטגרציה הצליח<br/>
                        2024-01-20 14:20:05 - הגדרות עודכנו<br/>
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ניהול אינטגרציות - {businessId}
        </h1>
        <p className="text-gray-600 mt-2">
          נהל את האינטגרציות של העסק עם שירותים חיצוניים
        </p>
      </div>

      {renderIntegrationDetails()}
    </div>
  );
};
