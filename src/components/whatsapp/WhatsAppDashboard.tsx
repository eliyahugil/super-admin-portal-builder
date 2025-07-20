import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, MessageSquare, BarChart3 } from 'lucide-react';
import { WhatsAppConnection } from './WhatsAppConnection';
import { WhatsAppMessenger } from './WhatsAppMessenger';
import { WhatsAppProvider, useWhatsAppContext } from '@/context/WhatsAppContext';

interface Props {
  businessId: string;
  businessName: string;
}

const WhatsAppDashboardContent: React.FC<{ businessName: string }> = ({ businessName }) => {
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Management */}
        <WhatsAppConnection />

        {/* Message Sender */}
        <WhatsAppMessenger />
      </div>

      {/* Sessions List */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>היסטוריית סשנים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.id}</p>
                      <Badge 
                        variant={
                          session.connection_status === 'connected' ? 'default' :
                          session.connection_status === 'connecting' ? 'secondary' : 'destructive'
                        }
                      >
                        {session.connection_status}
                      </Badge>
                    </div>
                    {session.phone_number && (
                      <p className="text-sm text-muted-foreground">
                        {session.phone_number}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      נוצר: {new Date(session.created_at).toLocaleString('he-IL')}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {session.last_connected_at && (
                      <p className="text-xs text-muted-foreground">
                        התחבר: {new Date(session.last_connected_at).toLocaleString('he-IL')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const WhatsAppDashboard: React.FC<Props> = ({ businessId, businessName }) => {
  return (
    <WhatsAppProvider businessId={businessId}>
      <WhatsAppDashboardContent businessName={businessName} />
    </WhatsAppProvider>
  );
};