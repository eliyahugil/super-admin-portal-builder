
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Mail, 
  HardDrive, 
  Map, 
  Users, 
  Video,
  Chrome,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface GoogleService {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  scope: string;
  description: string;
  isConnected: boolean;
}

interface GoogleOAuthManagerProps {
  businessId: string;
}

export const GoogleOAuthManager: React.FC<GoogleOAuthManagerProps> = ({ businessId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedServices, setConnectedServices] = useState<Set<string>>(new Set());
  const [authStatus, setAuthStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const googleServices: GoogleService[] = [
    {
      id: 'calendar',
      name: 'Google Calendar',
      icon: Calendar,
      scope: 'https://www.googleapis.com/auth/calendar',
      description: 'גישה מלאה ללוחות השנה שלך',
      isConnected: connectedServices.has('calendar')
    },
    {
      id: 'gmail',
      name: 'Gmail',
      icon: Mail,
      scope: 'https://www.googleapis.com/auth/gmail.modify',
      description: 'קריאה ושליחת אימיילים',
      isConnected: connectedServices.has('gmail')
    },
    {
      id: 'drive',
      name: 'Google Drive',
      icon: HardDrive,
      scope: 'https://www.googleapis.com/auth/drive',
      description: 'גישה לקבצים ב-Google Drive',
      isConnected: connectedServices.has('drive')
    },
    {
      id: 'maps',
      name: 'Google Maps',
      icon: Map,
      scope: 'https://www.googleapis.com/auth/mapsengine',
      description: 'שירותי מפות וניווט',
      isConnected: connectedServices.has('maps')
    },
    {
      id: 'contacts',
      name: 'Google Contacts',
      icon: Users,
      scope: 'https://www.googleapis.com/auth/contacts',
      description: 'ניהול אנשי קשר',
      isConnected: connectedServices.has('contacts')
    },
    {
      id: 'meet',
      name: 'Google Meet',
      icon: Video,
      scope: 'https://www.googleapis.com/auth/meetings',
      description: 'יצירת וניהול פגישות',
      isConnected: connectedServices.has('meet')
    }
  ];

  useEffect(() => {
    checkGoogleConnection();
  }, [businessId]);

  const checkGoogleConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('google_oauth_tokens')
        .select('scope, access_token')
        .eq('business_id', businessId)
        .eq('user_id', user?.id)
        .single();

      if (data && !error) {
        setAuthStatus('connected');
        // Parse connected services from scope
        const scopes = data.scope.split(' ');
        const connected = new Set<string>();
        
        googleServices.forEach(service => {
          if (scopes.some(scope => scope.includes(service.id) || service.scope === scope)) {
            connected.add(service.id);
          }
        });
        
        setConnectedServices(connected);
      } else {
        setAuthStatus('disconnected');
      }
    } catch (error) {
      console.error('Error checking Google connection:', error);
      setAuthStatus('disconnected');
    }
  };

  const getAllGoogleScopes = () => {
    return [
      // Core profile scopes
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid',
      // All service scopes
      ...googleServices.map(service => service.scope),
      // Additional useful scopes
      'https://www.googleapis.com/auth/photoslibrary.readonly',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/analytics.readonly'
    ].join(' ');
  };

  const connectToGoogle = async () => {
    setIsConnecting(true);
    setAuthStatus('connecting');

    try {
      // Create comprehensive OAuth URL with all scopes
      const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // This should come from Supabase secrets
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`);
      const scopes = encodeURIComponent(getAllGoogleScopes());
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scopes}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `include_granted_scopes=true`;

      // Open OAuth flow
      const authWindow = window.open(authUrl, 'GoogleAuth', 'width=500,height=600');
      
      // Listen for the callback
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          handleAuthSuccess(event.data.tokens);
          authWindow?.close();
          window.removeEventListener('message', messageListener);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          handleAuthError(event.data.error);
          authWindow?.close();
          window.removeEventListener('message', messageListener);
        }
      };

      window.addEventListener('message', messageListener);

      // Fallback timeout
      setTimeout(() => {
        if (authWindow && !authWindow.closed) {
          authWindow.close();
          setIsConnecting(false);
          setAuthStatus('disconnected');
          toast({
            title: 'זמן החיבור פג',
            description: 'נסה שוב להתחבר לGoogle',
            variant: 'destructive',
          });
        }
        window.removeEventListener('message', messageListener);
      }, 300000); // 5 minutes timeout

    } catch (error) {
      console.error('Error connecting to Google:', error);
      setIsConnecting(false);
      setAuthStatus('disconnected');
      toast({
        title: 'שגיאה בחיבור',
        description: 'לא ניתן להתחבר לGoogle. נסה שוב.',
        variant: 'destructive',
      });
    }
  };

  const handleAuthSuccess = async (tokens: any) => {
    try {
      // Save comprehensive OAuth tokens
      const { error } = await supabase
        .from('google_oauth_tokens')
        .upsert({
          business_id: businessId,
          user_id: user?.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          scope: getAllGoogleScopes(),
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'business_id,user_id'
        });

      if (error) throw error;

      setAuthStatus('connected');
      setIsConnecting(false);
      
      // Mark all services as connected
      const allServiceIds = new Set(googleServices.map(s => s.id));
      setConnectedServices(allServiceIds);

      toast({
        title: 'התחברות הצליחה!',
        description: 'כל שירותי Google מחוברים בהצלחה',
      });

      // Trigger data sync for all services
      await syncAllGoogleData();

    } catch (error) {
      console.error('Error saving Google tokens:', error);
      setAuthStatus('disconnected');
      setIsConnecting(false);
      toast({
        title: 'שגיאה בשמירת הנתונים',
        description: 'החיבור הצליח אבל לא ניתן לשמור את הנתונים',
        variant: 'destructive',
      });
    }
  };

  const handleAuthError = (error: string) => {
    console.error('Google Auth Error:', error);
    setIsConnecting(false);
    setAuthStatus('disconnected');
    toast({
      title: 'שגיאה באימות',
      description: error || 'לא ניתן להתחבר לGoogle',
      variant: 'destructive',
    });
  };

  const syncAllGoogleData = async () => {
    try {
      // Call edge function to sync all Google data
      const { error } = await supabase.functions.invoke('sync-google-services', {
        body: { businessId }
      });

      if (error) throw error;

      toast({
        title: 'סנכרון הנתונים החל',
        description: 'הנתונים מכל שירותי Google מתחילים להיטען',
      });
    } catch (error) {
      console.error('Error syncing Google data:', error);
      toast({
        title: 'שגיאה בסנכרון',
        description: 'לא ניתן לסנכרן את הנתונים מGoogle',
        variant: 'destructive',
      });
    }
  };

  const disconnectFromGoogle = async () => {
    try {
      const { error } = await supabase
        .from('google_oauth_tokens')
        .delete()
        .eq('business_id', businessId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setAuthStatus('disconnected');
      setConnectedServices(new Set());

      toast({
        title: 'התנתקות הושלמה',
        description: 'כל שירותי Google נותקו בהצלחה',
      });
    } catch (error) {
      console.error('Error disconnecting from Google:', error);
      toast({
        title: 'שגיאה בהתנתקות',
        description: 'לא ניתן להתנתק מGoogle',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Chrome className="h-5 w-5" />
            חיבור מקיף לשירותי Google
          </CardTitle>
          <CardDescription>
            התחבר פעם אחת וקבל גישה לכל שירותי Google הזמינים
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {authStatus === 'disconnected' && (
            <Alert>
              <Chrome className="h-4 w-4" />
              <AlertDescription>
                <strong>לא מחובר לGoogle</strong><br />
                התחבר כדי לקבל גישה לכל שירותי Google: Gmail, Calendar, Drive, Maps ועוד
              </AlertDescription>
            </Alert>
          )}

          {authStatus === 'connecting' && (
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                <strong>מתחבר לGoogle...</strong><br />
                אנא השלם את תהליך האימות בחלון הקופץ
              </AlertDescription>
            </Alert>
          )}

          {authStatus === 'connected' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>מחובר בהצלחה!</strong><br />
                כל שירותי Google זמינים לשימוש
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            {authStatus !== 'connected' ? (
              <Button 
                onClick={connectToGoogle} 
                disabled={isConnecting}
                className="flex-1"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    מתחבר...
                  </>
                ) : (
                  <>
                    <Chrome className="h-4 w-4 mr-2" />
                    התחבר לכל שירותי Google
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-2 w-full">
                <Button onClick={syncAllGoogleData} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  סנכרן הכל מחדש
                </Button>
                <Button onClick={disconnectFromGoogle} variant="destructive">
                  התנתק
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Services Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {googleServices.map((service) => {
          const IconComponent = service.icon;
          return (
            <Card key={service.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5" />
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                  {service.isConnected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <Badge variant={service.isConnected ? "default" : "secondary"}>
                  {service.isConnected ? 'מחובר' : 'לא מחובר'}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {authStatus === 'connected' && (
        <Card>
          <CardHeader>
            <CardTitle>הגדרות הרשאות מתקדמות</CardTitle>
            <CardDescription>
              נהל הרשאות ספציפיות לכל שירות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="permissions">
              <TabsList>
                <TabsTrigger value="permissions">הרשאות</TabsTrigger>
                <TabsTrigger value="sync">סנכרון</TabsTrigger>
                <TabsTrigger value="logs">לוגים</TabsTrigger>
              </TabsList>
              
              <TabsContent value="permissions" className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-gray-500">ממשק ניהול הרשאות יהיה זמין בקרוב</p>
                </div>
              </TabsContent>
              
              <TabsContent value="sync" className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-gray-500">הגדרות סנכרון יהיו זמינות בקרוב</p>
                </div>
              </TabsContent>
              
              <TabsContent value="logs" className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-gray-500">לוגי פעילות יהיו זמינים בקרוב</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
