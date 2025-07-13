import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  ExternalLink,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { cn } from '@/lib/utils';

interface WhatsAppChatPanelProps {
  customerPhone?: string;
  leadId?: string;
}

export const WhatsAppChatPanel: React.FC<WhatsAppChatPanelProps> = ({
  customerPhone,
  leadId
}) => {
  const [message, setMessage] = useState('');
  const { 
    contacts, 
    getMessages, 
    sendMessage, 
    isConnected,
    createLeadFromContact 
  } = useWhatsAppIntegration();

  // Find contact by phone number
  const contact = contacts.find(c => c.phone_number === customerPhone);
  const contactId = contact?.id;

  // Get messages for this contact
  const { data: messages = [] } = getMessages(contactId || '');

  const handleSendMessage = async () => {
    if (!message.trim() || !contactId) return;
    
    try {
      await sendMessage.mutateAsync({
        contactId,
        content: message.trim()
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name?: string, phone?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return phone?.slice(-2) || '??';
  };

  const getMessageStatus = (status: string, direction: string) => {
    if (direction === 'incoming') return null;
    
    switch (status) {
      case 'sent':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCircle2 className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  if (!customerPhone) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            אין מספר טלפון ללקוח זה
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              WhatsApp לא מחובר
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="/integrations/whatsapp" target="_blank" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                חבר WhatsApp
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{customerPhone}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              אין היסטוריית צ'אט עם לקוח זה
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}`, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              פתח ב-WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            מחובר
          </Badge>
        </CardTitle>
        
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={contact.profile_picture_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(contact.name, contact.phone_number)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {contact.name || contact.phone_number}
            </p>
            <p className="text-xs text-muted-foreground">
              {contact.phone_number}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">אין הודעות עדיין</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] p-2 rounded-lg text-sm",
                    msg.direction === 'outgoing'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-70">
                      {formatTime(msg.timestamp)}
                    </span>
                    {getMessageStatus(msg.status, msg.direction)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="הקלד הודעה..."
              className="text-sm"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessage.isPending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};