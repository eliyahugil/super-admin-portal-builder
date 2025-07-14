import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from './useBusiness';
import { toast } from 'sonner';

export interface WhatsAppContact {
  id: string;
  business_id: string;
  phone_number: string;
  name?: string;
  profile_picture_url?: string;
  last_seen?: string;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  business_id: string;
  contact_id: string;
  message_id: string;
  content: string;
  message_type: 'text' | 'image' | 'audio' | 'video' | 'document';
  direction: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
  reply_to_message_id?: string;
  media_url?: string;
  created_at: string;
}

export interface WhatsAppConnection {
  id: string;
  business_id: string;
  phone_number: string;
  device_name?: string;
  session_data?: any;
  qr_code?: string;
  connection_status: 'disconnected' | 'connecting' | 'connected';
  last_connected_at?: string;
  created_at: string;
  updated_at: string;
}

export const useWhatsAppIntegration = () => {
  const { businessId } = useBusiness();
  const queryClient = useQueryClient();

  // Get WhatsApp connection status
  const { data: connection, isLoading: connectionLoading } = useQuery({
    queryKey: ['whatsapp-connection', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('whatsapp_business_connections')
        .select('*')
        .eq('business_id', businessId)
        .maybeSingle();
      
      if (error) throw error;
      return data as WhatsAppConnection | null;
    },
    enabled: !!businessId
  });

  // Get WhatsApp contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['whatsapp-contacts', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select('*')
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as WhatsAppContact[];
    },
    enabled: !!businessId
  });

  // Get messages for a specific contact
  const getMessages = (contactId: string) => {
    return useQuery({
      queryKey: ['whatsapp-messages', contactId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('whatsapp_messages')
          .select('*')
          .eq('contact_id', contactId)
          .order('timestamp', { ascending: true });
        
        if (error) throw error;
        return data as WhatsAppMessage[];
      },
      enabled: !!contactId
    });
  };

  // Create or update contact
  const upsertContact = useMutation({
    mutationFn: async (contactData: Partial<WhatsAppContact> & { phone_number: string }) => {
      if (!businessId) throw new Error('Business ID required');
      
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .upsert({
          ...contactData,
          business_id: businessId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-contacts'] });
    }
  });

  // Send message via Twilio
  const sendMessage = useMutation({
    mutationFn: async ({
      contactId,
      phoneNumber,
      content,
      messageType = 'text'
    }: {
      contactId?: string;
      phoneNumber: string;
      content: string;
      messageType?: WhatsAppMessage['message_type'];
    }) => {
      if (!businessId) throw new Error('Business ID required');
      
      // Use the Twilio-powered edge function
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          businessId,
          to: phoneNumber,
          message: content,
          contactId
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', variables.contactId] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-contacts'] });
    }
  });

  // Create lead from WhatsApp contact
  const createLeadFromContact = useMutation({
    mutationFn: async (contactId: string) => {
      if (!businessId) throw new Error('Business ID required');
      
      // First get the contact
      const { data: contact, error: contactError } = await supabase
        .from('whatsapp_contacts')
        .select('*')
        .eq('id', contactId)
        .single();
      
      if (contactError) throw contactError;
      
      // Create lead
      const { data, error } = await supabase
        .from('leads')
        .insert({
          business_id: businessId,
          name: contact.name || contact.phone_number,
          phone: contact.phone_number,
          source: 'whatsapp',
          status: 'new',
          notes: `נוצר אוטומטי מ-WhatsApp\nטלפון: ${contact.phone_number}`
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('ליד חדש נוצר בהצלחה מהצ\'אט!');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      toast.error('שגיאה ביצירת ליד: ' + error.message);
    }
  });

  // Auto-create lead for new incoming messages
  const autoCreateLeadFromMessage = async (message: WhatsAppMessage) => {
    if (message.direction !== 'incoming') return;
    
    try {
      // Check if lead already exists for this phone number
      const { data: contact } = await supabase
        .from('whatsapp_contacts')
        .select('phone_number')
        .eq('id', message.contact_id)
        .single();
      
      if (!contact) return;
      
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('business_id', businessId)
        .eq('phone', contact.phone_number)
        .maybeSingle();
      
      if (existingLead) return; // Lead already exists
      
      // Create new lead
      await createLeadFromContact.mutateAsync(message.contact_id);
    } catch (error) {
      console.error('Error auto-creating lead:', error);
    }
  };

  return {
    // Connection
    connection,
    connectionLoading,
    
    // Contacts
    contacts,
    contactsLoading,
    upsertContact,
    
    // Messages
    getMessages,
    sendMessage,
    
    // CRM Integration
    createLeadFromContact,
    autoCreateLeadFromMessage,
    
    // State
    isConnected: connection?.connection_status === 'connected',
    isConnecting: connection?.connection_status === 'connecting'
  };
};