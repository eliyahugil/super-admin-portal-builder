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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SuperAdminIntegrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [googleMapsConfig, setGoogleMapsConfig] = useState({
    api_key: '',
    region: 'IL'
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  console.log('=== SuperAdminIntegrations RENDER ===');
  console.log('Current activeTab:', activeTab);

  // Fetch Google Maps configuration
  const { data: mapsIntegration, refetch: refetchMapsConfig } = useQuery({
    queryKey: ['google-maps-config'],
    queryFn: async () => {
      console.log('=== FETCHING GOOGLE MAPS CONFIG ===');
      const { data, error } = await supabase
        .from('global_integrations')
        .select('*')
        .eq('integration_name', 'google_maps')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching Google Maps config:', error);
        throw error;
      }

      console.log('Google Maps config data:', data);
      
      if (data?.config) {
        const config = data.config as Record<string, any>;
        setGoogleMapsConfig({
          api_key: config.api_key || '',
          region: config.region || 'IL'
        });
      }

      return data;
    },
  });

  const handleTabChange = (value: string) => {
    console.log('=== TAB CHANGE ===');
    console.log('Changing to tab:', value);
    setActiveTab(value);
  };

  const saveGoogleMapsSettings = async () => {
    console.log('=== SAVE GOOGLE MAPS SETTINGS ===');
    console.log('Config to save:', googleMapsConfig);
    
    setSaving(true);
    
    try {
      // First, check if the integration exists
      const { data: existingIntegration, error: checkError } = await supabase
        .from('global_integrations')
        .select('id')
        .eq('integration_name', 'google_maps')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingIntegration) {
        // Update existing integration
        console.log('Updating existing Google Maps integration');
        const { error } = await supabase
          .from('global_integrations')
          .update({
            config: googleMapsConfig,
            updated_at: new Date().toISOString()
          })
          .eq('integration_name', 'google_maps');

        if (error) throw error;
      } else {
        // Create new integration
        console.log('Creating new Google Maps integration');
        const { error } = await supabase
          .from('global_integrations')
          .insert({
            integration_name: 'google_maps',
            display_name: 'Google Maps',
            description: 'Google Maps API for geocoding and places',
            is_active: true,
            config: googleMapsConfig
          });

        if (error) throw error;
      }

      toast({
        title: 'הצלחה',
        description: 'הגדרות Google Maps נשמרו בהצלחה',
      });

      refetchMapsConfig();
    } catch (error) {
      console.error('Error saving Google Maps settings:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשמור את הגדרות Google Maps',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestClick = () => {
    console.log('=== TEST BUTTON CLICKED ===');
    alert('כפתור בדיקה נלחץ בהצלחה!');
  };

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
                  value={googleMapsConfig.api_key}
                  onChange={(e) => setGoogleMapsConfig(prev => ({
                    ...prev,
                    api_key: e.target.value
                  }))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  מפתח API עם הפעלת Geocoding API ו-Places API
                </p>
              </div>

              <div>
                <Label htmlFor="default-region">אזור ברירת מחדל</Label>
                <Input 
                  id="default-region" 
                  value={googleMapsConfig.region}
                  onChange={(e) => setGoogleMapsConfig(prev => ({
                    ...prev,
                    region: e.target.value
                  }))}
                  placeholder="IL" 
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">קוד מדינה (ISO 3166-1)</p>
              </div>

              <div>
                <Label className="text-base font-medium">שירותים נדרשים</Label>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Geocoding API</p>
                      <p className="text-sm text-gray-500">המרת כתובות לקואורדינטות</p>
                    </div>
                    <Badge variant="default">נדרש</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Places API</p>
                      <p className="text-sm text-gray-500">חיפוש מקומות ואוטוקומפליט</p>
                    </div>
                    <Badge variant="default">נדרש</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Maps JavaScript API</p>
                      <p className="text-sm text-gray-500">הצגת מפות אינטראקטיביות</p>
                    </div>
                    <Badge variant="secondary">אופציונלי</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Distance Matrix API</p>
                      <p className="text-sm text-gray-500">חישוב מרחקים וזמני נסיעה</p>
                    </div>
                    <Badge variant="secondary">אופציונלי</Badge>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full"
                onClick={saveGoogleMapsSettings}
                disabled={saving || !googleMapsConfig.api_key}
              >
                {saving ? 'שומר...' : 'שמור הגדרות Google Maps'}
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
