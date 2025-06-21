
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { GoogleOAuthManager } from './GoogleOAuthManager';
import { 
  GoogleServicesOverview,
  GoogleServicesGrid,
  GoogleServicesData,
  GoogleServicesSettings,
  createGoogleServices
} from './google-services';

interface GoogleServicesIntegrationProps {
  businessId: string;
}

export const GoogleServicesIntegration: React.FC<GoogleServicesIntegrationProps> = ({ businessId }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('oauth');
  
  const { 
    integrations, 
    oauthTokens, 
    events, 
    loading, 
    syncCalendar, 
    isSyncing 
  } = useGoogleCalendar(businessId);

  const googleServices = createGoogleServices(events);

  const handleSyncAll = async () => {
    try {
      // Sync Calendar
      if (integrations.length > 0) {
        await syncCalendar(integrations[0].id);
      }
      
      toast({
        title: 'סנכרון הושלם',
        description: 'כל שירותי Google סונכרנו בהצלחה',
      });
    } catch (error) {
      console.error('Error syncing services:', error);
      toast({
        title: 'שגיאה בסנכרון',
        description: 'לא ניתן לסנכרן את השירותים',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GoogleServicesOverview
        oauthTokens={oauthTokens}
        isSyncing={isSyncing}
        onSyncAll={handleSyncAll}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="oauth">התחברות</TabsTrigger>
          <TabsTrigger value="services">שירותים</TabsTrigger>
          <TabsTrigger value="data">נתונים</TabsTrigger>
          <TabsTrigger value="settings">הגדרות</TabsTrigger>
        </TabsList>

        <TabsContent value="oauth">
          <GoogleOAuthManager businessId={businessId} />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <GoogleServicesGrid services={googleServices} />
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <GoogleServicesData events={events} />
        </TabsContent>

        <TabsContent value="settings">
          <GoogleServicesSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
