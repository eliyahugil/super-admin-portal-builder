import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Key, 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Save,
  TestTube
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { toast } from 'sonner';

interface WhatsAppBusinessIntegration {
  id: string;
  display_name: string;
  credentials: {
    access_token: string;
    phone_number_id: string;
    webhook_verify_token: string;
  };
  config: {
    api_version: string;
    business_account_id: string;
  };
  is_active: boolean;
  last_tested_at?: string;
}

export const WhatsAppBusinessSettings: React.FC = () => {
  const { businessId } = useBusiness();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    access_token: '',
    phone_number_id: '',
    webhook_verify_token: '',
    api_version: 'v18.0',
    business_account_id: ''
  });

  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testMessage, setTestMessage] = useState('שלום! זוהי הודעת בדיקה מ-WhatsApp Business API');

  const { data: integration, isLoading } = useQuery({
    queryKey: ['whatsapp-integration', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('business_integrations')
        .select('*')
        .eq('business_id', businessId)
        .eq('integration_name', 'whatsapp')
        .maybeSingle();
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!businessId
  });

  // Update form data when integration loads
  React.useEffect(() => {
    if (integration) {
      const credentials = integration.credentials as any;
      const config = integration.config as any;
      
      setFormData({
        access_token: credentials?.access_token || '',
        phone_number_id: credentials?.phone_number_id || '',
        webhook_verify_token: credentials?.webhook_verify_token || '',
        api_version: config?.api_version || 'v18.0',
        business_account_id: config?.business_account_id || ''
      });
    }
  }, [integration]);

  const saveIntegrationMutation = useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error('Business ID required');
      
      const { data, error } = await supabase
        .from('business_integrations')
        .upsert({
          business_id: businessId,
          integration_name: 'whatsapp',
          display_name: 'WhatsApp Business API',
          credentials: {
            access_token: formData.access_token,
            phone_number_id: formData.phone_number_id,
            webhook_verify_token: formData.webhook_verify_token
          },
          config: {
            api_version: formData.api_version,
            business_account_id: formData.business_account_id
          },
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-integration'] });
      toast.success('הגדרות WhatsApp נשמרו בהצלחה');
    },
    onError: (error) => {
      toast.error('שגיאה בשמירת ההגדרות: ' + error.message);
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      if (!formData.access_token || !formData.phone_number_id) {
        throw new Error('נדרש Access Token ו-Phone Number ID');
      }

      // Test the WhatsApp Business API connection
      const response = await fetch(
        `https://graph.facebook.com/${formData.api_version}/${formData.phone_number_id}?fields=verified_name,display_phone_number`,
        {
          headers: {
            'Authorization': `Bearer ${formData.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'בדיקת החיבור נכשלה');
      }

      const result = await response.json();
      
      // Update last tested timestamp
      if (integration) {
        await supabase
          .from('business_integrations')
          .update({ last_tested_at: new Date().toISOString() })
          .eq('id', integration.id);
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-integration'] });
      toast.success(`חיבור הצליח! מספר טלפון מאומת: ${result.display_phone_number}`);
    },
    onError: (error) => {
      toast.error('בדיקת החיבור נכשלה: ' + error.message);
    }
  });

  const sendTestMessageMutation = useMutation({
    mutationFn: async () => {
      if (!testPhoneNumber || !testMessage) {
        throw new Error('נדרש מספר טלפון והודעה');
      }

      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          phoneNumber: testPhoneNumber,
          message: testMessage,
          businessId: businessId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('הודעת בדיקה נשלחה בהצלחה!');
      setTestPhoneNumber('');
    },
    onError: (error) => {
      toast.error('שגיאה בשליחת הודעת הבדיקה: ' + error.message);
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div className="p-6">טוען הגדרות...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">הגדרות WhatsApp</h2>
          <p className="text-muted-foreground">
            הגדרו את חיבור WhatsApp Gateway לחיבור QR או Business API לשליחת הודעות אוטומטיות
          </p>
        </div>
        {integration && (
          <Badge variant={integration.is_active ? "default" : "secondary"}>
            {integration.is_active ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                פעיל
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                לא פעיל
              </>
            )}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="gateway" className="space-y-6">
        <TabsList>
          <TabsTrigger value="gateway">WhatsApp Gateway</TabsTrigger>
          <TabsTrigger value="settings">Business API</TabsTrigger>
          <TabsTrigger value="test">בדיקה</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="gateway" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                הגדרות WhatsApp Gateway
              </CardTitle>
              <CardDescription>
                הגדירו את ה-Gateway להתחברות QR וסנכרון הודעות
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  WhatsApp Gateway מאפשר התחברות באמצעות QR קוד כמו WhatsApp Web. אידיאלי לעסקים קטנים שרוצים חיבור פשוט ללא הגדרות מורכבות.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gateway_url">Gateway URL</Label>
                  <Input
                    id="gateway_url"
                    value="http://localhost:3000"
                    placeholder="http://localhost:3000"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    כתובת ה-Gateway המקומי (ברירת מחדל)
                  </p>
                </div>

                <Button 
                  onClick={async () => {
                    try {
                      // Save Gateway integration
                      const gatewayIntegration = {
                        business_id: businessId,
                        integration_name: 'whatsapp',
                        display_name: 'WhatsApp Gateway',
                        credentials: {},
                        config: {
                          gateway_url: 'http://localhost:3000',
                          type: 'gateway'
                        },
                        is_active: true
                      };

                      const { error } = await supabase
                        .from('business_integrations')
                        .upsert(gatewayIntegration);

                      if (error) throw error;

                      queryClient.invalidateQueries({ queryKey: ['whatsapp-integration'] });
                      toast.success('WhatsApp Gateway הוגדר בהצלחה! עכשיו תוכלו להתחבר בטאב החיבור.');
                    } catch (error: any) {
                      toast.error('שגיאה בהגדרת Gateway: ' + error.message);
                    }
                  }}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  הגדר WhatsApp Gateway
                </Button>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">מה זה WhatsApp Gateway?</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• התחברות פשוטה באמצעות QR קוד</li>
                    <li>• אין צורך בהרשמה ל-Meta for Developers</li>
                    <li>• מתאים לעסקים קטנים ובינוניים</li>
                    <li>• סנכרון אוטומטי של הודעות ואנשי קשר</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                פרטי API
              </CardTitle>
              <CardDescription>
                הזינו את פרטי ה-API שקיבלתם מ-Meta Business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  כדי לקבל את פרטי ה-API, עליכם לרשום אפליקציה ב-{' '}
                  <a 
                    href="https://developers.facebook.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Meta for Developers
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="access_token">Access Token</Label>
                  <Input
                    id="access_token"
                    type="password"
                    value={formData.access_token}
                    onChange={(e) => handleInputChange('access_token', e.target.value)}
                    placeholder="EAAG..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number_id">Phone Number ID</Label>
                  <Input
                    id="phone_number_id"
                    value={formData.phone_number_id}
                    onChange={(e) => handleInputChange('phone_number_id', e.target.value)}
                    placeholder="1234567890123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook_verify_token">Webhook Verify Token</Label>
                  <Input
                    id="webhook_verify_token"
                    value={formData.webhook_verify_token}
                    onChange={(e) => handleInputChange('webhook_verify_token', e.target.value)}
                    placeholder="my_webhook_token"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_version">API Version</Label>
                  <Input
                    id="api_version"
                    value={formData.api_version}
                    onChange={(e) => handleInputChange('api_version', e.target.value)}
                    placeholder="v18.0"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="business_account_id">Business Account ID (אופציונלי)</Label>
                  <Input
                    id="business_account_id"
                    value={formData.business_account_id}
                    onChange={(e) => handleInputChange('business_account_id', e.target.value)}
                    placeholder="1234567890123456"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => saveIntegrationMutation.mutate()}
                  disabled={saveIntegrationMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saveIntegrationMutation.isPending ? 'שומר...' : 'שמור הגדרות'}
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => testConnectionMutation.mutate()}
                  disabled={testConnectionMutation.isPending || !formData.access_token || !formData.phone_number_id}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {testConnectionMutation.isPending ? 'בודק...' : 'בדוק חיבור'}
                </Button>
              </div>

              {integration?.last_tested_at && (
                <p className="text-sm text-muted-foreground">
                  נבדק לאחרונה: {new Date(integration.last_tested_at).toLocaleString('he-IL')}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                שליחת הודעת בדיקה
              </CardTitle>
              <CardDescription>
                שלחו הודעת בדיקה כדי לוודא שהחיבור עובד
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test_phone">מספר טלפון (עם קידומת מדינה)</Label>
                <Input
                  id="test_phone"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="+972501234567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test_message">הודעה</Label>
                <Input
                  id="test_message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="הודעת בדיקה"
                />
              </div>

              <Button 
                onClick={() => sendTestMessageMutation.mutate()}
                disabled={sendTestMessageMutation.isPending || !testPhoneNumber || !testMessage || !integration?.is_active}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                {sendTestMessageMutation.isPending ? 'שולח...' : 'שלח הודעת בדיקה'}
              </Button>

              {!integration?.is_active && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    יש לשמור תחילה את הגדרות ה-API כדי לשלוח הודעת בדיקה
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>הגדרות Webhooks</CardTitle>
              <CardDescription>
                הגדירו webhooks לקבלת הודעות נכנסות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  <strong>Webhook URL:</strong><br />
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    https://xmhmztipuvzmwgbcovch.supabase.co/functions/v1/whatsapp-webhook
                  </code>
                  <br /><br />
                  <strong>Verify Token:</strong> {formData.webhook_verify_token || 'לא הוגדר'}
                  <br /><br />
                  הגדירו את ה-webhook ב-Meta for Developers עם הפרטים לעיל
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};