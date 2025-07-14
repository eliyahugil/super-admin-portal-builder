
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
  const { businessId: urlBusinessId } = useParams();
  const { business } = useBusiness();
  
  // Use businessId from URL params if available, otherwise fall back to useBusiness hook
  const businessId = urlBusinessId || business?.id;
  
  const { integrations, businessIntegrations, updateIntegration, loading } = useIntegrations(businessId);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'merged' | 'tabs'>('merged');

  console.log('=== BusinessIntegrations ===');
  console.log('URL Business ID:', urlBusinessId);
  console.log('Hook Business ID:', business?.id);
  console.log('Final Business ID:', businessId);
  console.log('Available integrations:', integrations);
  console.log('Business integrations:', businessIntegrations);

  const handleIntegrationSave = (integrationKey: string, updatedFields: Record<string, any>) => {
    console.log('=== handleIntegrationSave START ===');
    console.log('Business ID:', businessId);
    console.log('Integration Key:', integrationKey);
    console.log('Updated Fields:', updatedFields);
    
    if (!businessId) {
      console.error('No business ID available');
      return;
    }
    
    // Use the updateIntegration function from useIntegrations hook
    try {
      console.log('Calling updateIntegration...');
      updateIntegration({
        integrationName: integrationKey,
        values: {
          credentials: updatedFields,
          config: updatedFields,
          is_active: true,
        }
      });
      console.log('updateIntegration called successfully');
    } catch (error) {
      console.error('Error calling updateIntegration:', error);
    }
    console.log('=== handleIntegrationSave END ===');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">טוען אינטגרציות...</div>
      </div>
    );
  }

  if (!businessId) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">לא נמצא עסק</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">ניהול אינטגרציות</h1>
          <p className="text-sm sm:text-base text-gray-600">הגדר ונהל את האינטגרציות של העסק</p>
        </div>
        <IntegrationViewModeToggle
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          integrationCount={integrations.length}
        />
      </div>

      {/* Failure Notifications */}
      <IntegrationFailureNotifications businessId={businessId} />

      {/* Main Content */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="text-xs sm:text-sm">אינטגרציות פעילות</TabsTrigger>
          <TabsTrigger value="available" className="text-xs sm:text-sm">אינטגרציות זמינות</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs sm:text-sm">יומן כללי</TabsTrigger>
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
                    businessId={businessId}
                    viewMode={viewMode}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
          <IntegrationAuditLog businessId={businessId} />
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
              businessId={businessId}
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
