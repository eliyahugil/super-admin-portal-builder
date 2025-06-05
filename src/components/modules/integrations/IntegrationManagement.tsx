
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SupportedIntegrationsList } from './SupportedIntegrationsList';
import { BusinessIntegrationsList } from './BusinessIntegrationsList';
import { GlobalIntegrationsAdmin } from './GlobalIntegrationsAdmin';
import { ModuleConfigDashboard } from '../config/ModuleConfigDashboard';
import { useBusiness } from '@/hooks/useBusiness';

export const IntegrationManagement: React.FC = () => {
  const { isSuperAdmin } = useBusiness();
  const [activeTab, setActiveTab] = useState('modules');

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול מודולים ואינטגרציות</h1>
        <p className="text-gray-600 mt-2">
          נהל את המודולים והאינטגרציות של העסק והתחבר לשירותים חיצוניים
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="modules">מודולים זמינים</TabsTrigger>
          <TabsTrigger value="supported">אינטגרציות זמינות</TabsTrigger>
          <TabsTrigger value="business">האינטגרציות שלי</TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="admin">ניהול גלובלי</TabsTrigger>
          )}
        </TabsList>

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

        <TabsContent value="supported">
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
