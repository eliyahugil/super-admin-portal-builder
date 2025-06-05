
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SuperAdminIntegrationsDashboard } from './SuperAdminIntegrationsDashboard';
import { GlobalIntegrationsAdmin } from '../modules/integrations/GlobalIntegrationsAdmin';
import { IntegrationTestManager } from './IntegrationTestManager';
import { IntegrationStatusMonitor } from './IntegrationStatusMonitor';
import { Key, Settings, Activity, MapPin, Globe, MessageSquare, FileText, Users } from 'lucide-react';

export const SuperAdminIntegrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabChange = (value: string) => {
    console.log('=== TAB CHANGE ===');
    console.log('Changing to tab:', value);
    setActiveTab(value);
  };

  const handleTestClick = () => {
    console.log('=== TEST BUTTON CLICKED ===');
    alert('כפתור בדיקה נלחץ בהצלחה!');
  };

  console.log('=== SuperAdminIntegrations RENDER ===');
  console.log('Current activeTab:', activeTab);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול אינטגרציות כללי</h1>
        <p className="text-gray-600 mt-2">
          ניהול מפתחות גלובליים ואינטגרציות לכל המערכת
        </p>
        
        {/* כפתור בדיקה */}
        <Button 
          onClick={handleTestClick}
          className="mt-4 bg-red-500 hover:bg-red-600"
        >
          🔥 בדיקה - האם הכפתור עובד?
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger 
            value="dashboard"
            onClick={() => console.log('Dashboard tab clicked')}
          >
            דשבורד ראשי
          </TabsTrigger>
          <TabsTrigger 
            value="global"
            onClick={() => console.log('Global tab clicked')}
          >
            אינטגרציות גלובליות
          </TabsTrigger>
          <TabsTrigger 
            value="testing"
            onClick={() => console.log('Testing tab clicked')}
          >
            בדיקת אינטגרציות
          </TabsTrigger>
          <TabsTrigger 
            value="maps"
            onClick={() => console.log('Maps tab clicked')}
          >
            Google Maps
          </TabsTrigger>
          <TabsTrigger 
            value="status"
            onClick={() => console.log('Status tab clicked')}
          >
            מוניטור סטטוס
          </TabsTrigger>
          <TabsTrigger 
            value="translations"
            onClick={() => console.log('Translations tab clicked')}
          >
            תרגומים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <SuperAdminIntegrationsDashboard />
        </TabsContent>

        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                ניהול אינטגרציות גלובליות
              </CardTitle>
              <CardDescription>
                הגדרת מפתחות API גלובליים ואינטגרציות משותפות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GlobalIntegrationsAdmin />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing">
          <IntegrationTestManager />
        </TabsContent>

        <TabsContent value="maps">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                הגדרות Google Maps
              </CardTitle>
              <CardDescription>
                ניהול מפתח Google Maps API ותצורת שירותי מפות
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="google-maps-key">Google Maps API Key</Label>
                <Input 
                  id="google-maps-key" 
                  type="password" 
                  placeholder="AIzaSy..." 
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-base font-medium">שירותים מופעלים</Label>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Geocoding API</p>
                      <p className="text-sm text-gray-500">המרת כתובות לקואורדינטות</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Places API</p>
                      <p className="text-sm text-gray-500">חיפוש מקומות ואוטוקומפליט</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Maps JavaScript API</p>
                      <p className="text-sm text-gray-500">הצגת מפות אינטראקטיביות</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Distance Matrix API</p>
                      <p className="text-sm text-gray-500">חישוב מרחקים וזמני נסיעה</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="default-region">אזור ברירת מחדל</Label>
                <Input 
                  id="default-region" 
                  defaultValue="IL" 
                  placeholder="IL" 
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">קוד מדינה (ISO 3166-1)</p>
              </div>

              <Button 
                className="w-full"
                onClick={() => {
                  console.log('=== SAVE GOOGLE MAPS SETTINGS ===');
                  alert('הגדרות Google Maps נשמרו!');
                }}
              >
                שמור הגדרות Google Maps
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <IntegrationStatusMonitor />
        </TabsContent>

        <TabsContent value="translations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                תרגום שדות ומונחים
              </CardTitle>
              <CardDescription>
                תרגום שמות שדות וקטגוריות לשפות שונות
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium">קטגוריות אינטגרציות</Label>
                  <div className="space-y-3 mt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="maps" defaultValue="maps" />
                      <Input placeholder="מפות וניווט" defaultValue="מפות וניווט" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="crm" defaultValue="crm" />
                      <Input placeholder="ניהול לקוחות" defaultValue="ניהול לקוחות" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="invoicing" defaultValue="invoicing" />
                      <Input placeholder="חשבוניות" defaultValue="חשבוניות" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="communication" defaultValue="communication" />
                      <Input placeholder="תקשורת" defaultValue="תקשורת" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">שדות כתובת</Label>
                  <div className="space-y-3 mt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="street_address" defaultValue="street_address" />
                      <Input placeholder="כתובת" defaultValue="כתובת" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="city" defaultValue="city" />
                      <Input placeholder="עיר" defaultValue="עיר" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="postal_code" defaultValue="postal_code" />
                      <Input placeholder="מיקוד" defaultValue="מיקוד" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="country" defaultValue="country" />
                      <Input placeholder="מדינה" defaultValue="מדינה" />
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full"
                onClick={() => {
                  console.log('=== SAVE TRANSLATIONS ===');
                  alert('תרגומים נשמרו!');
                }}
              >
                שמור תרגומים
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
