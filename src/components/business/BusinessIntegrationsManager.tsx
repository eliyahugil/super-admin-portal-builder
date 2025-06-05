
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  MessageSquare, 
  Facebook, 
  FileText, 
  CreditCard,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export const BusinessIntegrationsManager: React.FC = () => {
  const { businessId, integration } = useParams();

  const integrations = [
    {
      id: 'google-maps',
      name: 'Google Maps',
      description: 'שירותי מיקום וניווט',
      icon: MapPin,
      status: 'connected',
      category: 'maps'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'הודעות ללקוחות',
      icon: MessageSquare,
      status: 'disconnected',
      category: 'communication'
    },
    {
      id: 'facebook',
      name: 'Facebook Leads',
      description: 'ניהול לידים מפייסבוק',
      icon: Facebook,
      status: 'error',
      category: 'marketing'
    },
    {
      id: 'invoices',
      name: 'מערכת חשבוניות',
      description: 'הפקת חשבוניות אוטומטית',
      icon: FileText,
      status: 'connected',
      category: 'finance'
    },
    {
      id: 'payments',
      name: 'מערכת תשלומים',
      description: 'קבלת תשלומים אונליין',
      icon: CreditCard,
      status: 'disconnected',
      category: 'finance'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">מחובר</Badge>;
      case 'disconnected':
        return <Badge className="bg-gray-100 text-gray-800">לא מחובר</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">שגיאה</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const renderIntegrationDetails = () => {
    if (!integration) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((int) => (
            <Card key={int.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <int.icon className="h-8 w-8 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{int.name}</CardTitle>
                      <CardDescription>{int.description}</CardDescription>
                    </div>
                  </div>
                  {getStatusIcon(int.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {getStatusBadge(int.status)}
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    הגדר
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // הצגת הגדרות אינטגרציה ספציפית
    const currentIntegration = integrations.find(int => int.id === integration);
    if (!currentIntegration) {
      return <div>אינטגרציה לא נמצאה</div>;
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <currentIntegration.icon className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle>{currentIntegration.name}</CardTitle>
              <CardDescription>{currentIntegration.description}</CardDescription>
            </div>
            {getStatusBadge(currentIntegration.status)}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="settings">הגדרות</TabsTrigger>
              <TabsTrigger value="usage">שימוש</TabsTrigger>
              <TabsTrigger value="logs">לוגים</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">הפעל אינטגרציה</Label>
                    <p className="text-sm text-gray-500">אפשר/בטל את השימוש באינטגרציה</p>
                  </div>
                  <Switch checked={currentIntegration.status === 'connected'} />
                </div>

                {integration === 'google-maps' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="api-key">מפתח API</Label>
                      <Input 
                        id="api-key" 
                        type="password" 
                        placeholder="הזן מפתח Google Maps API" 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="region">אזור ברירת מחדל</Label>
                      <Input 
                        id="region" 
                        defaultValue="ישראל" 
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {integration === 'whatsapp' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone">מספר טלפון</Label>
                      <Input 
                        id="phone" 
                        placeholder="972501234567" 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="token">Access Token</Label>
                      <Input 
                        id="token" 
                        type="password" 
                        placeholder="הזן WhatsApp Business API Token" 
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                <Button className="w-full">
                  שמור הגדרות
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="usage">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">1,247</p>
                        <p className="text-sm text-gray-600">שימושים החודש</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">98.5%</p>
                        <p className="text-sm text-gray-600">זמינות</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">₪45</p>
                        <p className="text-sm text-gray-600">עלות החודש</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm font-mono">
                    2024-01-20 14:30:25 - בקשת API הצליחה<br/>
                    2024-01-20 14:25:10 - חיבור לאינטגרציה הצליח<br/>
                    2024-01-20 14:20:05 - הגדרות עודכנו<br/>
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ניהול אינטגרציות - {businessId}
        </h1>
        <p className="text-gray-600 mt-2">
          נהל את האינטגרציות של העסק עם שירותים חיצוניים
        </p>
      </div>

      {renderIntegrationDetails()}
    </div>
  );
};
