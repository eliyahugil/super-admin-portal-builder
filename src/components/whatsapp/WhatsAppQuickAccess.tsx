import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Smartphone, Send } from 'lucide-react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useNavigate } from 'react-router-dom';

interface Props {
  businessId: string;
}

export const WhatsAppQuickAccess: React.FC<Props> = ({ businessId }) => {
  const { isConnected, sessions } = useWhatsApp(businessId);
  const navigate = useNavigate();

  const handleOpenWhatsApp = () => {
    navigate('/modules/integrations/whatsapp');
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleOpenWhatsApp}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            WhatsApp Business
          </CardTitle>
          <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
            {isConnected ? "מחובר" : "לא מחובר"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">סטטוס:</span>
          <span className={isConnected ? "text-green-600" : "text-gray-500"}>
            {isConnected ? "מוכן לשליחה" : "יש להתחבר"}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">סשנים פעילים:</span>
          <span>{sessions.filter(s => s.connection_status === 'connected').length}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-1" />
            נהל
          </Button>
          <Button size="sm" className="flex-1" disabled={!isConnected}>
            <Send className="h-4 w-4 mr-1" />
            שלח
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};