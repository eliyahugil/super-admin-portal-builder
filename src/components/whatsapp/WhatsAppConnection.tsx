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
    <div className="container mx-auto max-w-4xl p-3 sm:p-6 space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Smartphone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">חיבור WhatsApp Business</CardTitle>
                <CardDescription className="text-sm mt-1">
                  חברו את WhatsApp Business לניהול הודעות ולקוחות
                </CardDescription>
              </div>
            </div>
            {connection && (
              <div className="flex justify-start sm:justify-end">
                {getStatusBadge(connection.connection_status)}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {connection?.last_error && connection.connection_status === 'disconnected' && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                שגיאה אחרונה: {connection.last_error}
              </AlertDescription>
            </Alert>
          )}

          {/* חיבור לא קיים או מנותק */}
          {!connection || connection.connection_status === 'disconnected' ? (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  לחצו על "התחבר ל-WhatsApp" כדי להתחיל את תהליך החיבור וליצור QR קוד לסריקה
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => {
                  console.log('🔗 Connect button clicked, businessId:', businessId);
                  connectMutation.mutate();
                }}
                disabled={connectMutation.isPending}
                className="w-full h-12 text-base"
                size="lg"
              >
                {connectMutation.isPending ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                    מתחיל חיבור...
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5 mr-3" />
                    התחבר ל-WhatsApp
                  </>
                )}
              </Button>
            </div>
          ) 
          
          /* מצב התחברות */
          : connection.connection_status === 'connecting' ? (
            <div className="space-y-6">
              <Alert className="border-orange-200 bg-orange-50">
                <QrCode className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  סרקו את קוד ה-QR עם הטלפון שלכם כדי להתחבר
                </AlertDescription>
              </Alert>
              
              {connection.qr_code ? (
                <div className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-200 text-center">
                  <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                    <img 
                      src={connection.qr_code} 
                      alt="QR Code לחיבור WhatsApp" 
                      className="w-48 h-48 sm:w-56 sm:h-56 mx-auto"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-xl text-center border">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
                  <p className="text-gray-600 font-medium mb-1">יוצר קוד QR...</p>
                  <p className="text-sm text-gray-500">אנא המתינו רגע</p>
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3 text-center">הוראות חיבור:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-200 text-blue-900 w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium">1</span>
                    פתחו את WhatsApp בטלפון
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-200 text-blue-900 w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium">2</span>
                    הגדרות ← מכשירים מקושרים
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-200 text-blue-900 w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium">3</span>
                    לחצו על "קשר מכשיר"
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-200 text-blue-900 w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium">4</span>
                    סרקו את הקוד למעלה
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  יצירת QR חדש
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  className="flex-1"
                >
                  ביטול החיבור
                </Button>
              </div>
            </div>
          ) 
          
          /* מחובר בהצלחה */
          : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Wifi className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium text-green-800">WhatsApp מחובר בהצלחה!</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-green-700">מספר טלפון:</span>
                    <span className="font-medium text-green-800">{connection.phone_number || 'לא זמין'}</span>
                  </div>
                  
                  {connection.last_connected_at && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="text-green-700">התחבר לאחרונה:</span>
                      <span className="font-medium text-green-800">
                        {new Date(connection.last_connected_at).toLocaleString('he-IL')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline"
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                  className="flex-1"
                >
                  {syncMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      בודק סטטוס...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      עדכון סטטוס
                    </>
                  )}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  className="flex-1"
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