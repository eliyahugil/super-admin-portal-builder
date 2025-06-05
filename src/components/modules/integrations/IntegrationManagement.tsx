
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/MainSidebar';
import { SupportedIntegrationsList } from './SupportedIntegrationsList';
import { BusinessIntegrationsList } from './BusinessIntegrationsList';
import { GlobalIntegrationsAdmin } from './GlobalIntegrationsAdmin';
import { ModuleConfigDashboard } from '../config/ModuleConfigDashboard';
import { useBusiness } from '@/hooks/useBusiness';
import { Settings, Crown } from 'lucide-react';

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MainSidebar />
        <div className="flex-1">
          <header className="h-12 flex items-center border-b bg-background px-4">
            <SidebarTrigger />
          </header>
          <div className="p-6 space-y-6">
            {isSuperAdmin && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-amber-600" />
                      <div>
                        <h3 className="font-semibold text-amber-800">מנהל מערכת</h3>
                        <p className="text-sm text-amber-700">גש לדשבורד הניהול המתקדם</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-amber-300 text-amber-800 hover:bg-amber-100"
                      onClick={() => window.open('/admin/integrations', '_blank')}
                    >
                      דשבורד סופר אדמין
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
        </div>
      </div>
    </SidebarProvider>
  );
};
