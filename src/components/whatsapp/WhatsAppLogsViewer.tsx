import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWhatsAppLogs } from '@/hooks/useWhatsAppLogs';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { MessageSquare, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  businessId: string;
}

export const WhatsAppLogsViewer: React.FC<Props> = ({ businessId }) => {
  const { data: logs, refetch } = useWhatsAppLogs(businessId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'ממתין';
      case 'sent':
        return 'נשלח';
      case 'failed':
        return 'נכשל';
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary' as const;
      case 'sent':
        return 'default' as const;
      case 'failed':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const resendMessage = async (logId: string, phone: string, message: string) => {
    try {
      const response = await supabase.functions.invoke('whatsapp-manager', {
        body: {
          action: 'send_message',
          business_id: businessId,
          phone_number: phone,
          message: message
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('ההודעה נשלחה מחדש בהצלחה');
      refetch();
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('שגיאה בשליחה מחדש');
    }
  };

  if (!logs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            היסטוריית הודעות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">טוען...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          היסטוריית הודעות
        </CardTitle>
        <CardDescription>
          כל ההודעות שנשלחו דרך המערכת ({logs.length} הודעות)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              עדיין לא נשלחו הודעות
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <Badge variant={getStatusVariant(log.status)}>
                        {getStatusText(log.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {log.category}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <strong>אל:</strong> {log.phone}
                  </div>
                  
                  <div className="text-sm bg-muted/50 p-2 rounded">
                    {log.message}
                  </div>

                  {log.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      <strong>שגיאה:</strong> {log.error}
                    </div>
                  )}

                  {log.sent_at && (
                    <div className="text-xs text-muted-foreground">
                      נשלח ב: {format(new Date(log.sent_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </div>
                  )}

                  {log.status === 'failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resendMessage(log.id, log.phone, log.message)}
                      className="mt-2"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      שלח מחדש
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};