import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, MessageSquare, BarChart3, Send, Users, History } from 'lucide-react';
import { WhatsAppConnection } from './WhatsAppConnection';
import { WhatsAppMessenger } from './WhatsAppMessenger';
import { WhatsAppBulkSender } from './WhatsAppBulkSender';
import { WhatsAppLogsViewer } from './WhatsAppLogsViewer';
import { WhatsAppProvider, useWhatsAppContext } from '@/context/WhatsAppContext';

interface Props {
  businessId: string;
  businessName: string;
}

const WhatsAppDashboardContent: React.FC<{ businessName: string; businessId: string }> = ({ businessName, businessId }) => {
  const { sessions, isConnected } = useWhatsAppContext();

  const getQuickStats = () => {
    return {
      totalSessions: sessions.length,
      connectedSessions: sessions.filter(s => s.connection_status === 'connected').length,
      lastActivity: sessions[0]?.updated_at,
    };
  };

  const stats = getQuickStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">WhatsApp Business</h2>
          <p className="text-muted-foreground">{businessName}</p>
        </div>
        <Badge variant={isConnected ? "default" : "secondary"}>
          {isConnected ? "מחובר" : "לא מחובר"}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">סה"כ סשנים</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
              <Smartphone className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">סשנים מחוברים</p>
                <p className="text-2xl font-bold">{stats.connectedSessions}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">פעילות אחרונה</p>
                <p className="text-sm">
                  {stats.lastActivity 
                    ? new Date(stats.lastActivity).toLocaleDateString('he-IL')
                    : 'אין נתונים'
                  }
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different features */}
      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            חיבור
          </TabsTrigger>
          <TabsTrigger value="messaging" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            הודעות
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            שליחה מרוכזת
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            היסטוריה
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-4">
          <WhatsAppConnection />
        </TabsContent>

        <TabsContent value="messaging" className="space-y-4">
          <WhatsAppMessenger />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <WhatsAppBulkSender businessId={businessId} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <WhatsAppLogsViewer businessId={businessId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const WhatsAppDashboard: React.FC<Props> = ({ businessId, businessName }) => {
  return (
    <WhatsAppProvider businessId={businessId}>
      <WhatsAppDashboardContent businessName={businessName} businessId={businessId} />
    </WhatsAppProvider>
  );
};