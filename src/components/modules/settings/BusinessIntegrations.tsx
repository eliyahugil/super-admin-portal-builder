
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Plus, AlertTriangle } from 'lucide-react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useBusiness } from '@/hooks/useBusiness';
import { 
  DynamicIntegrationForm,
  IntegrationFailureNotifications,
  IntegrationViewModeToggle,
  IntegrationAuditLog
} from '@/components/modules/integrations';

export const BusinessIntegrations: React.FC = () => {
  const { business } = useBusiness();
  const { integrations, businessIntegrations, loading } = useIntegrations(business?.id);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'merged' | 'tabs'>('merged');

  const handleIntegrationSave = (integrationKey: string, updatedFields: Record<string, any>) => {
    console.log('Saving integration:', integrationKey, updatedFields);
    // Implementation will be handled by parent component
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">טוען אינטגרציות...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">לא נמצא עסק</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ניהול אינטגרציות</h1>
          <p className="text-gray-600">הגדר ונהל את האינטגרציות של העסק</p>
        </div>
        <IntegrationViewModeToggle
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          integrationCount={integrations.length}
        />
      </div>

      {/* Failure Notifications */}
      <IntegrationFailureNotifications businessId={business.id} />

      {/* Main Content */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">אינטגרציות פעילות</TabsTrigger>
          <TabsTrigger value="available">אינטגרציות זמינות</TabsTrigger>
          <TabsTrigger value="audit">יומן כללי</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {businessIntegrations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  אין אינטגרציות פעילות
                </h3>
                <p className="text-gray-500 mb-4">
                  התחל בהוספת האינטגרציה הראשונה שלך
                </p>
                <Button onClick={() => setSelectedIntegration('whatsapp')}>
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף אינטגרציה
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {businessIntegrations.map((integration) => {
                const supportedIntegration = integrations.find(
                  i => i.integration_name === integration.integration_name
                );
                
                if (!supportedIntegration) return null;

                return (
                  <DynamicIntegrationForm
                    key={integration.id}
                    integrationKey={integration.integration_name}
                    initialData={integration.credentials}
                    onSave={(updatedFields) => 
                      handleIntegrationSave(integration.integration_name, updatedFields)
                    }
                    businessId={business.id}
                    viewMode={viewMode}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter(integration => 
                !businessIntegrations.some(bi => bi.integration_name === integration.integration_name)
              )
              .map((integration) => (
                <Card key={integration.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{integration.display_name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      onClick={() => setSelectedIntegration(integration.integration_name)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      הוסף אינטגרציה
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <IntegrationAuditLog businessId={business.id} />
        </TabsContent>
      </Tabs>

      {/* Integration Setup Modal/Form */}
      {selectedIntegration && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              הגדרת אינטגרציה חדשה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DynamicIntegrationForm
              integrationKey={selectedIntegration}
              onSave={(updatedFields) => {
                handleIntegrationSave(selectedIntegration, updatedFields);
                setSelectedIntegration(null);
              }}
              businessId={business.id}
              viewMode={viewMode}
            />
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedIntegration(null)}
              >
                ביטול
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
