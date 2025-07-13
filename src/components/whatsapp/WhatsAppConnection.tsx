import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Smartphone, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusiness } from '@/hooks/useBusiness';
import { toast } from 'sonner';

interface WhatsAppConnection {
  id: string;
  phone_number: string;
  device_name: string;
  connection_status: 'disconnected' | 'connecting' | 'connected';
  qr_code?: string;
  last_connected_at?: string;
}

export const WhatsAppConnection: React.FC = () => {
  const { businessId } = useBusiness();
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

  const connectMutation = useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error('Business ID is required');
      
      // Call the real WhatsApp connection API
      const { data, error } = await supabase.functions.invoke('whatsapp-connect', {
        body: { businessId }
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
    return <div className="p-6">טוען...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              חיבור WhatsApp Business
            </span>
            {connection && getStatusBadge(connection.connection_status)}
          </CardTitle>
          <CardDescription>
            חברו את WhatsApp Business לחשבון שלכם כדי לנהל הודעות ולקוחות
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!connection || connection.connection_status === 'disconnected' ? (
            <div className="space-y-4">
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  לחצו על "התחבר" כדי להתחבר ל-WhatsApp Business API
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => connectMutation.mutate()}
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
                    התחבר ל-WhatsApp
                  </>
                )}
              </Button>
            </div>
          ) : connection.connection_status === 'connecting' ? (
            <div className="space-y-4">
              <div className="bg-muted p-8 rounded-lg text-center">
                <RefreshCw className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground mb-2">
                  מתחבר ל-WhatsApp Business API...
                </p>
                <p className="text-xs text-muted-foreground">
                  זה עלול לקחת כמה שניות
                </p>
              </div>
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
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
              <Button 
                variant="destructive" 
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
                className="w-full"
              >
                נתק חיבור
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};