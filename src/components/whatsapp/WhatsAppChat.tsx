import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Phone, MoreVertical, MessageCircle } from 'lucide-react';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusiness } from '@/hooks/useBusiness';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface WhatsAppChatProps {
  contactId: string;
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ contactId }) => {
  const { businessId } = useBusiness();
  const { contacts, getMessages } = useWhatsAppIntegration();
  const { data: messages = [], isLoading } = getMessages(contactId);
  const queryClient = useQueryClient();
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contact = contacts.find(c => c.id === contactId);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!businessId || !contact) throw new Error('Missing required data');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-native', {
        body: { 
          action: 'send',
          businessId,
          phone: contact.phone_number,
          message: content,
          contactName: contact.name
        }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', contactId] });
      setNewMessage('');
      toast.success('הודעה נשלחה בהצלחה!');
    },
    onError: (error) => {
      toast.error('שגיאה בשליחת הודעה: ' + error.message);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate(newMessage.trim());
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('972')) {
      return `+${phone.slice(0, 3)}-${phone.slice(3, 5)}-${phone.slice(5, 8)}-${phone.slice(8)}`;
    } else if (phone.startsWith('0')) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  const getContactInitials = (contact: any) => {
    if (contact?.name) {
      return contact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return contact?.phone_number.slice(-2) || '??';
  };

  const getMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!contact) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>איש קשר לא נמצא</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Chat Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={contact.profile_picture_url} />
              <AvatarFallback>
                {getContactInitials(contact)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-lg">
                {contact.name || 'ללא שם'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span dir="ltr">{formatPhoneNumber(contact.phone_number)}</span>
                {contact.is_blocked && (
                  <Badge variant="destructive" className="text-xs">
                    חסום
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-2 mb-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                  ${message.direction === 'outgoing'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                  }
                `}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <span className="text-xs opacity-70">
                    {getMessageTime(message.timestamp)}
                  </span>
                  {message.direction === 'outgoing' && (
                    <div className="flex items-center">
                      {message.status === 'sent' && (
                        <div className="text-xs opacity-70">✓</div>
                      )}
                      {message.status === 'delivered' && (
                        <div className="text-xs opacity-70">✓✓</div>
                      )}
                      {message.status === 'read' && (
                        <div className="text-xs text-blue-400">✓✓</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>אין עדיין הודעות</p>
            <p className="text-sm">התחילו שיחה עם {contact.name || 'איש הקשר'}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="כתבו הודעה..."
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={sendMessageMutation.isPending || !newMessage.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};