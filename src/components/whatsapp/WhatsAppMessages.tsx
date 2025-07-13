import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Clock, CheckCheck } from 'lucide-react';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { useBusiness } from '@/hooks/useBusiness';

export const WhatsAppMessages: React.FC = () => {
  const { businessId } = useBusiness();
  const { connection, contacts } = useWhatsAppIntegration();

  if (!connection || connection.connection_status !== 'connected') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            הודעות WhatsApp
          </CardTitle>
          <CardDescription>
            התחבר ל-WhatsApp כדי לראות הודעות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>התחבר ל-WhatsApp כדי להתחיל לנהל הודעות</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">אנשי קשר</p>
                <p className="text-2xl font-bold">{contacts?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">הודעות היום</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">הודעות שנקראו</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            אנשי קשר
          </CardTitle>
          <CardDescription>
            רשימת אנשי הקשר מ-WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts && contacts.length > 0 ? (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {contact.name ? contact.name.charAt(0).toUpperCase() : contact.phone_number.charAt(-2)}
                    </div>
                    <div>
                      <p className="font-medium">{contact.name || 'לא ידוע'}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {contact.last_seen && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(contact.last_seen).toLocaleDateString('he-IL')}
                      </div>
                    )}
                    <Badge variant={contact.is_blocked ? 'destructive' : 'secondary'}>
                      {contact.is_blocked ? 'חסום' : 'פעיל'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>אין אנשי קשר עדיין</p>
              <p className="text-sm">לחץ על "סנכרן הודעות" כדי למשוך אנשי קשר</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};