import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Wifi, WifiOff, QrCode, MessageSquare } from 'lucide-react';
import { useWhatsApp } from '@/hooks/useWhatsApp';

interface Props {
  businessId: string;
}

export const WhatsAppConnection: React.FC<Props> = ({ businessId }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { currentSession, isConnected, loading, createSession } = useWhatsApp(businessId);

  const handleConnect = async () => {
    if (!phoneNumber.trim()) return;
    await createSession(phoneNumber);
  };

  const getStatusColor = () => {
    if (!currentSession) return 'secondary';
    switch (currentSession.connection_status) {
      case 'connected': return 'default';
      case 'connecting': return 'secondary';
      default: return 'destructive';
    }
  };

  const getStatusIcon = () => {
    if (!currentSession || currentSession.connection_status === 'disconnected') {
      return <WifiOff className="h-4 w-4" />;
    }
    if (currentSession.connection_status === 'connected') {
      return <Wifi className="h-4 w-4" />;
    }
    return <QrCode className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!currentSession) return 'לא מחובר';
    switch (currentSession.connection_status) {
      case 'connected': return 'מחובר';
      case 'connecting': return 'מתחבר...';
      default: return 'לא מחובר';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          חיבור WhatsApp Business
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">סטטוס חיבור:</span>
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>

        {currentSession?.phone_number && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">מספר טלפון:</span>
            <span className="text-sm">{currentSession.phone_number}</span>
          </div>
        )}

        {currentSession?.last_connected_at && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">התחבר לאחרונה:</span>
            <span className="text-sm">
              {new Date(currentSession.last_connected_at).toLocaleString('he-IL')}
            </span>
          </div>
        )}

        {!isConnected && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="phone">מספר טלפון (כולל קידומת מדינה)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="972501234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleConnect} 
              disabled={!phoneNumber.trim()}
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              התחבר ל-WhatsApp
            </Button>
          </div>
        )}

        {currentSession?.qr_code && (
          <div className="space-y-2">
            <Label>סרוק את הקוד עם WhatsApp שלך:</Label>
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              <img 
                src={currentSession.qr_code} 
                alt="QR Code for WhatsApp"
                className="max-w-48 max-h-48"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              פתח את WhatsApp ← הגדרות ← מכשירים מקושרים ← קשר מכשיר ← סרוק QR
            </p>
          </div>
        )}

        {currentSession?.last_error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{currentSession.last_error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};