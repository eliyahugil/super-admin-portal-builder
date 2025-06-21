
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoogleOAuthManager } from '../GoogleOAuthManager';
import { GoogleServicesGrid } from './GoogleServicesGrid';
import { GoogleServicesData } from './GoogleServicesData';
import { GoogleServicesSettings } from './GoogleServicesSettings';
import { GoogleService } from './types';
import { GoogleCalendarEvent } from '@/hooks/useGoogleCalendar';

interface GoogleServicesTabsProps {
  businessId: string;
  activeTab: string;
  onTabChange: (value: string) => void;
  googleServices: GoogleService[];
  events: GoogleCalendarEvent[];
}

export const GoogleServicesTabs: React.FC<GoogleServicesTabsProps> = ({
  businessId,
  activeTab,
  onTabChange,
  googleServices,
  events
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
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
  );
};
