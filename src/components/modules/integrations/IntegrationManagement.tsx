
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SupportedIntegrationsList } from './SupportedIntegrationsList';
import { BusinessIntegrationsList } from './BusinessIntegrationsList';
import { GlobalIntegrationsAdmin } from './GlobalIntegrationsAdmin';
import { ModuleConfigDashboard } from '../config/ModuleConfigDashboard';
import { useBusiness } from '@/hooks/useBusiness';

export const IntegrationManagement: React.FC = () => {
  const { isSuperAdmin, businessId } = useBusiness();
  const [activeTab, setActiveTab] = useState('available');

  const tabs = [
    { value: 'available', label: 'אינטגרציות זמינות', show: true },
    { value: 'business', label: 'האינטגרציות שלי', show: !!businessId },
    { value: 'modules', label: 'מודולים', show: true },
    { value: 'admin', label: 'ניהול גלובלי', show: isSuperAdmin }
  ].filter(tab => tab.show);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full grid-cols-${tabs.length}`}>
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>אינטגרציות זמינות</CardTitle>
              <CardDescription>
                רשימת כל האינטגרציות הזמינות במערכת
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupportedIntegrationsList />
            </CardContent>
          </Card>
        </TabsContent>

        {businessId && (
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>האינטגרציות שלי</CardTitle>
                <CardDescription>
                  נהל את האינטגרציות הפעילות של העסק שלך
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BusinessIntegrationsList />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>מודולים זמינים</CardTitle>
              <CardDescription>
                רשימת כל המודולים הזמינים עבור העסק שלך
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModuleConfigDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>ניהול גלובלי</CardTitle>
                <CardDescription>
                  ניהול אינטגרציות גלובליות וקונפיגורציה כללית
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GlobalIntegrationsAdmin />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
