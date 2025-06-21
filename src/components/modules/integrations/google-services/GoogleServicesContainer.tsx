
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { GoogleServicesHeader } from './GoogleServicesHeader';
import { GoogleServicesTabs } from './GoogleServicesTabs';
import { createGoogleServices } from './servicesConfig';

interface GoogleServicesContainerProps {
  businessId: string;
}

export const GoogleServicesContainer: React.FC<GoogleServicesContainerProps> = ({ businessId }) => {
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
      <GoogleServicesHeader
        oauthTokens={oauthTokens}
        isSyncing={isSyncing}
        onSyncAll={handleSyncAll}
      />

      <GoogleServicesTabs
        businessId={businessId}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        googleServices={googleServices}
        events={events}
      />
    </div>
  );
};
