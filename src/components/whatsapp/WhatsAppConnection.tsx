import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Smartphone, Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
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

  const { data: connection, isLoading } = useQuery({
    queryKey: ['whatsapp-connection', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('whatsapp_business_connections')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(1)
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
      
      // Call the new WhatsApp Web client function
      const { data, error } = await supabase.functions.invoke('whatsapp-web-client', {
        body: { 
          action: 'connect',
          businessId 
        }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Connection success:', data);
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connection'] });
      toast.success('מתחיל תהליך חיבור ל-WhatsApp');
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
      toast.success('החיבור נותק בהצלחה');
    }
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('whatsapp-web-client', {
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
        return <Badge variant="default" className="bg-green-500 text-white"><Wifi className="h-3 w-3 mr-1" />מחובר</Badge>;
      case 'connecting':
        return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />מתחבר...</Badge>;
      case 'disconnected':
      default:
        return <Badge variant="destructive"><WifiOff className="h-3 w-3 mr-1" />לא מחובר</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] p-4">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">טוען נתוני חיבור...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* לא מחובר או מנותק */}
      {!connection || connection.connection_status === 'disconnected' ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Smartphone className="h-4 w-4" />
              <span className="font-medium">חיבור ל-WhatsApp</span>
            </div>
            <p className="text-sm text-blue-700">
              לחצו על "חבר ל-Twilio" כדי להתחבר ל-WhatsApp דרך Twilio API
            </p>
          </div>
          
          <Button 
            onClick={() => {
              console.log('🔗 Connect button clicked, businessId:', businessId);
              connectMutation.mutate();
            }}
            disabled={connectMutation.isPending}
            className="w-full"
            size="lg"
          >
            {connectMutation.isPending ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                מתחבר ל-Twilio...
              </>
            ) : (
              <>
                <Smartphone className="h-5 w-5 mr-2" />
                חבר ל-Twilio WhatsApp
              </>
            )}
          </Button>
        </div>
      ) 
      
      /* מחובר בהצלחה */
      : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1.5 bg-green-100 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-medium text-green-800">WhatsApp מחובר בהצלחה!</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-green-700">מספר Twilio:</span>
                <span className="font-mono text-green-800">{connection.phone_number || 'לא זמין'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-green-700">שירות:</span>
                <span className="font-medium text-green-800">{connection.device_name}</span>
              </div>
              
              {connection.last_connected_at && (
                <div className="flex justify-between items-center">
                  <span className="text-green-700">התחבר ב:</span>
                  <span className="text-green-800 text-xs">
                    {new Date(connection.last_connected_at).toLocaleString('he-IL')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              size="sm"
              className="flex-1"
            >
              {syncMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  בודק...
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
              size="sm"
              className="flex-1"
            >
              נתק
            </Button>
          </div>

          {/* הערה על Twilio Sandbox */}
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">Twilio Sandbox</p>
                <p>זהו חיבור לסביבת בדיקה של Twilio. הודעות יישלחו דרך המספר הסנדבוקס של Twilio.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};