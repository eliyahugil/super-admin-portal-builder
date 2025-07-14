import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Smartphone, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { toast } from 'sonner';

interface WhatsAppConnection {
  id: string;
  phone_number: string;
  device_name: string;
  connection_status: 'disconnected' | 'connecting' | 'connected';
  qr_code?: string;
  last_connected_at?: string;
  last_error?: string;
}

export const WhatsAppConnection: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const queryClient = useQueryClient();
  const [qrCode, setQrCode] = useState<string>('');

  const { data: connection, isLoading } = useQuery({
    queryKey: ['whatsapp-connection', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('whatsapp_business_connections')
        .select('*')
        .eq('business_id', businessId)
        .maybeSingle();
      
      if (error) throw error;
      return data as WhatsAppConnection | null;
    },
    enabled: !!businessId,
    refetchInterval: (query) => {
      // Refetch more frequently if connecting
      return query.state.data?.connection_status === 'connecting' ? 2000 : 30000;
    }
  });

  // Check if WhatsApp Gateway integration exists
  const { data: integration } = useQuery({
    queryKey: ['whatsapp-gateway-integration', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('business_integrations')
        .select('*')
        .eq('business_id', businessId)
        .eq('integration_name', 'whatsapp')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!businessId
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error('Business ID is required');
      
      // Call the new native WhatsApp connection
      const { data, error } = await supabase.functions.invoke('whatsapp-native', {
        body: { 
          action: 'connect',
          businessId 
        }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connection'] });
      toast.success('WhatsApp מחובר בהצלחה!');
    },
    onError: (error) => {
      toast.error('שגיאה בחיבור: ' + error.message);
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!businessId || !connection) throw new Error('No connection to disconnect');
      
      const { error } = await supabase
        .from('whatsapp_business_connections')
        .update({
          connection_status: 'disconnected',
          qr_code: null
        })
        .eq('id', connection.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connection'] });
      setQrCode('');
      toast.success('החיבור נותק בהצלחה');
    }
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('whatsapp-native', {
        body: { 
          action: 'status',
          businessId 
        }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connection'] });
      toast.success('סטטוס עודכן בהצלחה!');
    },
    onError: (error) => {
      toast.error('שגיאה בעדכון סטטוס: ' + error.message);
    }
  });


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500"><Wifi className="h-3 w-3 mr-1" />מחובר</Badge>;
      case 'connecting':
        return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />מתחבר...</Badge>;
      case 'disconnected':
      default:
        return <Badge variant="destructive"><WifiOff className="h-3 w-3 mr-1" />לא מחובר</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-4 sm:p-6">טוען...</div>;
  }

  console.log('WhatsApp Connection Debug:', {
    businessId,
    connection,
    isLoading,
    hasConnection: !!connection
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <span className="text-base sm:text-lg">חיבור WhatsApp Business</span>
            </span>
            {connection && getStatusBadge(connection.connection_status)}
          </CardTitle>
          <CardDescription className="text-sm">
            חברו את WhatsApp Business לחשבון שלכם כדי לנהל הודעות ולקוחות
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connection?.last_error && connection.connection_status === 'disconnected' && (
            <Alert variant="destructive">
              <AlertDescription>
                שגיאה אחרונה: {connection.last_error}
              </AlertDescription>
            </Alert>
          )}
          {!connection || connection.connection_status === 'disconnected' ? (
            <div className="space-y-4">
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    לחצו על "התחבר מחדש" כדי להתחבר ל-WhatsApp Web וליצור QR קוד לסריקה
                  </AlertDescription>
                </Alert>
              <Button 
                onClick={() => {
                  console.log('🔗 Connect button clicked, businessId:', businessId);
                  connectMutation.mutate();
                }}
                disabled={connectMutation.isPending}
                className="w-full"
              >
                {connectMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    מתחבר...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    התחבר מחדש ל-WhatsApp
                  </>
                )}
              </Button>
            </div>
          ) : connection.connection_status === 'connecting' ? (
            <div className="space-y-4">
              <Alert>
                <QrCode className="h-4 w-4" />
                <AlertDescription>
                  סרקו את קוד ה-QR עם הטלפון שלכם כדי להתחבר
                </AlertDescription>
              </Alert>
              {connection.qr_code ? (
                <div className="flex justify-center p-4 sm:p-6 bg-white rounded-lg border">
                  <img 
                    src={connection.qr_code} 
                    alt="QR Code לחיבור WhatsApp" 
                    className="w-48 h-48 sm:w-64 sm:h-64"
                  />
                </div>
              ) : (
                <div className="bg-muted p-8 rounded-lg text-center">
                  <RefreshCw className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-spin" />
                  <p className="text-sm text-muted-foreground mb-2">
                    יוצר קוד QR...
                  </p>
                </div>
              )}
              <div className="text-center text-xs sm:text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="font-medium text-blue-800 mb-1">הוראות:</div>
                <div className="text-blue-700 space-y-1">
                  <div>1. פתחו את WhatsApp בטלפון</div>
                  <div>2. הגדרות ← מכשירים מקושרים</div>
                  <div>3. לחצו על "קשר מכשיר"</div>
                  <div>4. סרקו את הקוד</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending}
                  className="flex-1 text-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  יצירת QR חדש
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  className="flex-1 text-sm"
                >
                  ביטול
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">מחובר בהצלחה!</span>
                </div>
                <p className="text-sm text-green-700">
                  מספר טלפון: {connection.phone_number}
                </p>
                {connection.last_connected_at && (
                  <p className="text-xs text-green-600 mt-1">
                    התחבר לאחרונה: {new Date(connection.last_connected_at).toLocaleString('he-IL')}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline"
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                  className="flex-1 text-sm"
                >
                  {syncMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      בודק סטטוס...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      עדכן סטטוס
                    </>
                  )}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  className="flex-1 text-sm"
                >
                  נתק חיבור
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};