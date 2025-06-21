import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { GoogleOAuthManager } from './GoogleOAuthManager';
import { GoogleCalendarEventsList } from './GoogleCalendarEventsList';
import { 
  Calendar, 
  Mail, 
  HardDrive, 
  Map, 
  Users, 
  Video,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Settings
} from 'lucide-react';

interface GoogleServicesIntegrationProps {
  businessId: string;
}

export const GoogleServicesIntegration: React.FC<GoogleServicesIntegrationProps> = ({ businessId }) => {
  const { user } = useAuth();
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

  const googleServices = [
    {
      id: 'calendar',
      name: 'Google Calendar',
      icon: Calendar,
      description: 'ניהול אירועים ומשמרות',
      status: 'connected',
      lastSync: '5 דקות',
      dataCount: events.length
    },
    {
      id: 'gmail',
      name: 'Gmail',
      icon: Mail,
      description: 'שליחת התראות ועדכונים',
      status: 'connected',
      lastSync: '10 דקות',
      dataCount: 0
    },
    {
      id: 'drive',
      name: 'Google Drive',
      icon: HardDrive,
      description: 'שמירת מסמכים וקבצים',
      status: 'connected',
      lastSync: '2 שעות',
      dataCount: 0
    },
    {
      id: 'maps',
      name: 'Google Maps',
      icon: Map,
      description: 'מיקום סניפים וניווט',
      status: 'connected',
      lastSync: 'אתמול',
      dataCount: 0
    },
    {
      id: 'contacts',
      name: 'Google Contacts',
      icon: Users,
      description: 'ניהול אנשי קשר',
      status: 'pending',
      lastSync: 'לא סונכרן',
      dataCount: 0
    },
    {
      id: 'meet',
      name: 'Google Meet',
      icon: Video,
      description: 'פגישות וידאו',
      status: 'error',
      lastSync: 'שגיאה',
      dataCount: 0
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">מחובר</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">ממתין</Badge>;
      case 'error':
        return <Badge variant="destructive">שגיאה</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

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
      <Card>
        <CardHeader>
          <CardTitle>אינטגרציה מקיפה עם Google</CardTitle>
          <CardDescription>
            נהל את כל שירותי Google במקום אחד עם התחברות יחידה
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {oauthTokens.length > 0 ? 'מחובר לGoogle' : 'לא מחובר'}
              </span>
              {oauthTokens.length > 0 && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            <Button 
              onClick={handleSyncAll} 
              disabled={isSyncing || oauthTokens.length === 0}
              variant="outline"
            >
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              סנכרן הכל
            </Button>
          </div>

          {oauthTokens.length === 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>התחברות נדרשת</strong><br />
                התחבר לGoogle כדי להפעיל את כל השירותים
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {googleServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <Card key={service.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6" />
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>
                    
                    <div className="space-y-2">
                      {getStatusBadge(service.status)}
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>סנכרון אחרון: {service.lastSync}</div>
                        {service.status === 'connected' && (
                          <div>נתונים: {service.dataCount} פריטים</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Tabs defaultValue="calendar" className="space-y-4">
            <TabsList>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="gmail">Gmail</TabsTrigger>
              <TabsTrigger value="drive">Drive</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <GoogleCalendarEventsList events={events} />
            </TabsContent>

            <TabsContent value="gmail">
              <Card>
                <CardHeader>
                  <CardTitle>Gmail</CardTitle>
                  <CardDescription>
                    נתוני Gmail יהיו זמינים בקרוב
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">ממשק Gmail בפיתוח</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="drive">
              <Card>
                <CardHeader>
                  <CardTitle>Google Drive</CardTitle>
                  <CardDescription>
                    נתוני Drive יהיו זמינים בקרוב
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <HardDrive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">ממשק Drive בפיתוח</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts">
              <Card>
                <CardHeader>
                  <CardTitle>Google Contacts</CardTitle>
                  <CardDescription>
                    נתוני Contacts יהיו זמינים בקרוב
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">ממשק Contacts בפיתוח</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>הגדרות אינטגרציה</CardTitle>
              <CardDescription>
                נהל הגדרות מתקדמות לשירותי Google
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">סנכרון אוטומטי</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      סנכרן נתונים מGoogle כל שעה
                    </p>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      הגדר
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">התראות</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      קבל התראות על אירועים ושינויים
                    </p>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      הגדר
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">בחירת נתונים</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      בחר אילו נתונים לסנכרן
                    </p>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      הגדר
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">גיבוי</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      גבה נתונים ל-Google Drive
                    </p>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      הגדר
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
