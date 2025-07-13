import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { cn } from '@/lib/utils';

interface WhatsAppContact {
  id: string;
  phone_number: string;
  name?: string;
  profile_picture_url?: string;
  last_seen?: string;
  last_message?: {
    content: string;
    timestamp: string;
    direction: 'incoming' | 'outgoing';
  };
  unread_count?: number;
}

interface WhatsAppChatListProps {
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
}

export const WhatsAppChatList: React.FC<WhatsAppChatListProps> = ({
  selectedContactId,
  onSelectContact
}) => {
  const { businessId } = useBusiness();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['whatsapp-contacts', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select(`
          *,
          whatsapp_messages!inner(
            content,
            timestamp,
            direction
          )
        `)
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Process contacts to include last message info
      return data.map(contact => ({
        ...contact,
        last_message: contact.whatsapp_messages?.[0] ? {
          content: contact.whatsapp_messages[0].content,
          timestamp: contact.whatsapp_messages[0].timestamp,
          direction: contact.whatsapp_messages[0].direction
        } : undefined,
        unread_count: Math.floor(Math.random() * 5) // Mock unread count
      })) as WhatsAppContact[];
    },
    enabled: !!businessId
  });

  // Mock data for demonstration
  const mockContacts: WhatsAppContact[] = [
    {
      id: '1',
      phone_number: '+972501234567',
      name: 'אחמד כהן',
      profile_picture_url: '',
      last_message: {
        content: 'שלום, אני מעוניין במוצר שלכם',
        timestamp: new Date().toISOString(),
        direction: 'incoming'
      },
      unread_count: 2
    },
    {
      id: '2',
      phone_number: '+972507654321',
      name: 'שרה לוי',
      profile_picture_url: '',
      last_message: {
        content: 'תודה על השירות המצוין!',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        direction: 'incoming'
      },
      unread_count: 0
    },
    {
      id: '3',
      phone_number: '+972509876543',
      name: 'דוד יוסף',
      profile_picture_url: '',
      last_message: {
        content: 'מתי אפשר לקבל הצעת מחיר?',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        direction: 'incoming'
      },
      unread_count: 1
    }
  ];

  const displayContacts = contacts.length > 0 ? contacts : mockContacts;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });
    }
  };

  const getInitials = (name?: string, phone?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return phone?.slice(-2) || '??';
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש צ'אטים..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {displayContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-center">אין צ'אטים עדיין</p>
            <p className="text-sm text-center mt-2">כשתקבלו הודעות הן יופיעו כאן</p>
          </div>
        ) : (
          <div className="space-y-1">
            {displayContacts.map((contact) => (
              <div
                key={contact.id}
                className={cn(
                  "flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                  selectedContactId === contact.id && "bg-muted"
                )}
                onClick={() => onSelectContact(contact.id)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.profile_picture_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(contact.name, contact.phone_number)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">
                      {contact.name || contact.phone_number}
                    </h3>
                    <div className="flex items-center gap-2">
                      {contact.last_message && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(contact.last_message.timestamp)}
                        </span>
                      )}
                      {contact.unread_count && contact.unread_count > 0 && (
                        <Badge variant="default" className="h-5 w-5 text-xs rounded-full p-0 flex items-center justify-center">
                          {contact.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {contact.last_message && (
                    <div className="flex items-center gap-1">
                      {contact.last_message.direction === 'outgoing' && (
                        <span className="text-blue-500 text-xs">✓</span>
                      )}
                      <p className="text-sm text-muted-foreground truncate">
                        {contact.last_message.content}
                      </p>
                    </div>
                  )}
                  
                  {!contact.name && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <Phone className="h-3 w-3 inline mr-1" />
                      {contact.phone_number}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};