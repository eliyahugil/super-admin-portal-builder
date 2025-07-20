import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppSession {
  id: string;
  business_id: string;
  phone_number?: string;
  device_name?: string;
  connection_status: 'disconnected' | 'connecting' | 'connected';
  qr_code?: string;
  last_connected_at?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export const useWhatsApp = (businessId: string) => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const sessionId = `whatsapp-${businessId}`;

  // Fetch sessions for business
  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions((data || []) as WhatsAppSession[]);
    } catch (error) {
      console.error('Error fetching WhatsApp sessions:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני WhatsApp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new session
  const createSession = async (phoneNumber?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        body: {
          action: 'create_session',
          sessionId,
          businessId,
          phoneNumber,
        },
      });

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "סשן WhatsApp נוצר בהצלחה",
      });

      await fetchSessions();
      return data.session;
    } catch (error) {
      console.error('Error creating WhatsApp session:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור סשן WhatsApp",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Send message
  const sendMessage = async (phoneNumber: string, message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        body: {
          action: 'send_message',
          sessionId,
          phoneNumber,
          message,
        },
      });

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: `הודעה נשלחה ל-${phoneNumber}`,
      });

      return data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast({
        title: "שגיאה בשליחה",
        description: "לא ניתן לשלוח הודעת WhatsApp",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update session status
  const updateSessionStatus = async (status: string, error?: string) => {
    try {
      await supabase.functions.invoke('whatsapp-manager', {
        body: {
          action: 'update_status',
          sessionId,
          status,
          error,
        },
      });

      await fetchSessions();
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  // Get current session
  const getCurrentSession = () => {
    return sessions.find(session => session.id === sessionId);
  };

  // Check if connected
  const isConnected = () => {
    const session = getCurrentSession();
    return session?.connection_status === 'connected';
  };

  // Subscribe to real-time updates
  useEffect(() => {
    fetchSessions();

    const channel = supabase
      .channel(`whatsapp-sessions-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_sessions',
          filter: `business_id=eq.${businessId}`,
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId]);

  return {
    sessions,
    loading,
    currentSession: getCurrentSession(),
    isConnected: isConnected(),
    createSession,
    sendMessage,
    updateSessionStatus,
    fetchSessions,
  };
};