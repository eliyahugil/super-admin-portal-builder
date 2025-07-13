import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  UserPlus,
  ExternalLink
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WhatsAppMessage {
  id: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  message_type: 'text' | 'image' | 'audio' | 'video' | 'document';
}

interface WhatsAppContact {
  id: string;
  phone_number: string;
  name?: string;
  profile_picture_url?: string;
  last_seen?: string;
}

interface WhatsAppChatProps {
  contactId: string;
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ contactId }) => {
  const { businessId } = useBusiness();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: contact } = useQuery({
    queryKey: ['whatsapp-contact', contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select('*')
        .eq('id', contactId)
        .single();
      
      if (error) throw error;
      return data as WhatsAppContact;
    }
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['whatsapp-messages', contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('contact_id', contactId)
        .order('timestamp', { ascending: true });
      
      if (error) throw error;
      return data as WhatsAppMessage[];
    }
  });

  // Mock data for demonstration
  const mockContact: WhatsAppContact = {
    id: contactId,
    phone_number: '+972501234567',
    name: 'אחמד כהן',
    profile_picture_url: '',
    last_seen: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
  };

  const mockMessages: WhatsAppMessage[] = [
    {
      id: '1',
      content: 'שלום, אני מעוניין במוצר שלכם',
      direction: 'incoming',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'read',
      message_type: 'text'
    },
    {
      id: '2',
      content: 'שלום! אשמח לעזור לך. איזה מוצר מעניין אותך?',
      direction: 'outgoing',
      timestamp: new Date(Date.now() - 3300000).toISOString(),
      status: 'read',
      message_type: 'text'
    },
    {
      id: '3',
      content: 'אני מחפש פתרון לניהול לקוחות לעסק שלי',
      direction: 'incoming',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      status: 'read',
      message_type: 'text'
    },
    {
      id: '4',
      content: 'מעולה! אנחנו מתמחים בדיוק בזה. האם תרצה לקבוע פגישת הדגמה?',
      direction: 'outgoing',
      timestamp: new Date(Date.now() - 2700000).toISOString(),
      status: 'delivered',
      message_type: 'text'
    }
  ];

  const displayContact = contact || mockContact;
  const displayMessages = messages.length > 0 ? messages : mockMessages;

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!businessId) throw new Error('Business ID required');
      
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .insert({
          business_id: businessId,
          contact_id: contactId,
          content,
          direction: 'outgoing',
          message_id: `msg_${Date.now()}`,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', contactId] });
      setMessage('');
      toast.success('הודעה נשלחה');
    },
    onError: (error) => {
      toast.error('שגיאה בשליחת ההודעה: ' + error.message);
    }
  });

  const createLeadMutation = useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error('Business ID required');
      
      const { data, error } = await supabase
        .from('leads')
        .insert({
          business_id: businessId,
          name: displayContact.name || displayContact.phone_number,
          phone: displayContact.phone_number,
          source: 'whatsapp',
          status: 'new',
          notes: 'נוצר אוטומטית מ-WhatsApp'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('ליד חדש נוצר בהצלחה!');
    },
    onError: (error) => {
      toast.error('שגיאה ביצירת ליד: ' + error.message);
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
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

  const getMessageStatus = (message: WhatsAppMessage) => {
    if (message.direction === 'incoming') return null;
    
    switch (message.status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return <span className="text-blue-500">✓✓</span>;
      default:
        return null;
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={displayContact.profile_picture_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(displayContact.name, displayContact.phone_number)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">
                {displayContact.name || displayContact.phone_number}
              </h3>
              <p className="text-sm text-muted-foreground">
                {displayContact.last_seen 
                  ? `פעיל לאחרונה ${formatTime(displayContact.last_seen)}`
                  : 'אונליין'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => createLeadMutation.mutate()}
              disabled={createLeadMutation.isPending}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              צור ליד
            </Button>
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'
            )}
          >
            <Card
              className={cn(
                "max-w-xs p-3 shadow-sm",
                msg.direction === 'outgoing'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <div className="flex items-center justify-end gap-1 mt-2">
                <span className="text-xs opacity-70">
                  {formatTime(msg.timestamp)}
                </span>
                {getMessageStatus(msg)}
              </div>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="הקלד הודעה..."
              className="pl-4 pr-10"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute left-2 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};