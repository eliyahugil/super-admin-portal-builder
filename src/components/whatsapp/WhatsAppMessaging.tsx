import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Send, Phone, Clock, Check, CheckCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { toast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  phone_number: string;
  contact_name: string;
  profile_picture_url?: string;
  last_seen?: string;
  is_blocked: boolean;
}

interface Message {
  id: string;
  phone_number: string;
  message_content: string;
  direction: 'incoming' | 'outgoing';
  message_status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  contact_name?: string;
}

export const WhatsAppMessaging: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactName, setNewContactName] = useState('');

  // Fetch contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['whatsapp-contacts', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select('*')
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        phone_number: item.phone_number,
        contact_name: item.name || item.phone_number,
        profile_picture_url: item.profile_picture_url,
        last_seen: item.last_seen,
        is_blocked: item.is_blocked || false
      })) as Contact[];
    },
    enabled: !!businessId
  });

  // Fetch messages for selected contact  
  const { data: messages = [] } = useQuery({
    queryKey: ['whatsapp-messages', businessId, selectedContact?.phone_number],
    queryFn: async () => {
      if (!businessId || !selectedContact) return [];
      
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select(`
          *,
          whatsapp_contacts!contact_id(phone_number)
        `)
        .eq('business_id', businessId)
        .order('timestamp', { ascending: true });
      
      if (error) throw error;
      
      // Filter messages for selected contact
      const contactMessages = (data || []).filter(item => 
        item.whatsapp_contacts?.phone_number === selectedContact.phone_number
      );
      
      return contactMessages.map(item => ({
        id: item.id,
        phone_number: item.whatsapp_contacts?.phone_number || '',
        message_content: item.content,
        direction: item.direction as 'incoming' | 'outgoing',
        message_status: item.status as 'sent' | 'delivered' | 'read' | 'failed',
        timestamp: item.timestamp,
        contact_name: selectedContact.contact_name
      })) as Message[];
    },
    enabled: !!businessId && !!selectedContact
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ phone, message, contactName }: { phone: string; message: string; contactName?: string }) => {
      if (!businessId) throw new Error('Business ID is required');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-web-client', {
        body: { 
          action: 'send',
          businessId,
          phone,
          message,
          contactName
        }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-contacts'] });
      setNewMessage('');
      toast({
        title: "הודעה נשלחה",
        description: "ההודעה נשלחה בהצלחה",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בשליחת הודעה",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;
    
    sendMessageMutation.mutate({
      phone: selectedContact.phone_number,
      message: newMessage,
      contactName: selectedContact.contact_name
    });
  };

  const handleSendToNewContact = () => {
    if (!newMessage.trim() || !newContactPhone.trim()) return;
    
    sendMessageMutation.mutate({
      phone: newContactPhone,
      message: newMessage,
      contactName: newContactName || newContactPhone
    });
    
    setNewContactPhone('');
    setNewContactName('');
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <Clock className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[600px] border rounded-lg">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            שיחות WhatsApp
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {contacts.length} שיחות פעילות
          </p>
        </div>
        
        <ScrollArea className="h-[calc(600px-120px)]">
          <div className="p-2 space-y-1">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedContact?.id === contact.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10">
                      {contact.contact_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{contact.contact_name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {contact.phone_number}
                    </p>
                  </div>
                  {contact.is_blocked && (
                    <Badge variant="destructive" className="text-xs">חסום</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10">
                    {selectedContact.contact_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedContact.contact_name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedContact.phone_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.direction === 'outgoing'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.message_content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString('he-IL', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.direction === 'outgoing' && (
                          <div className="mr-2">
                            {getMessageStatusIcon(message.message_status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-card">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="כתבו הודעה..."
                  className="flex-1 min-h-[80px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* New Contact Form */
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>שליחת הודעה חדשה</CardTitle>
                <CardDescription>
                  שלחו הודעה לקשר חדש או בחרו שיחה קיימת מהרשימה
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="מספר טלפון (לדוגמה: +972501234567)"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                  />
                  <Input
                    placeholder="שם הקשר (אופציונלי)"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                  />
                </div>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="כתבו את ההודעה שלכם..."
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={handleSendToNewContact}
                  disabled={!newMessage.trim() || !newContactPhone.trim() || sendMessageMutation.isPending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  שלח הודעה
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};