import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WhatsAppSession {
  id: string;
  business_id: string;
  phone_number: string | null;
  device_name: string | null;
  connection_status: 'disconnected' | 'connecting' | 'connected';
  qr_code: string | null;
  last_connected_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

interface WhatsAppContextType {
  sessions: WhatsAppSession[];
  loading: boolean;
  currentSession: WhatsAppSession | undefined;
  isConnected: boolean;
  createSession: (phoneNumber?: string) => Promise<any>;
  sendMessage: (phoneNumber: string, message: string) => Promise<any>;
  updateSessionStatus: (status: string, error?: string) => Promise<void>;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

interface WhatsAppProviderProps {
  children: React.ReactNode;
  businessId: string;
}

export const WhatsAppProvider: React.FC<WhatsAppProviderProps> = ({ children, businessId }) => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<any>(null);

  const fetchSessions = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching WhatsApp sessions:', error);
        toast.error('שגיאה בטעינת סשני WhatsApp');
        return;
      }

      setSessions((data || []) as WhatsAppSession[]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('שגיאה בטעינת נתונים');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (phoneNumber?: string): Promise<any> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        body: {
          action: 'create_session',
          business_id: businessId,
          phone_number: phoneNumber,
        },
      });

      if (error) {
        console.error('Error creating WhatsApp session:', error);
        toast.error('שגיאה ביצירת סשן WhatsApp');
        throw error;
      }

      toast.success('סשן WhatsApp נוצר בהצלחה');
      await fetchSessions();
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (phoneNumber: string, message: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        body: {
          action: 'send_message',
          phone_number: phoneNumber,
          message: message,
        },
      });

      if (error) {
        console.error('Error sending WhatsApp message:', error);
        toast.error('שגיאה בשליחת הודעה');
        throw error;
      }

      toast.success('הודעה נשלחה בהצלחה');
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const updateSessionStatus = async (status: string, error?: string): Promise<void> => {
    try {
      await supabase.functions.invoke('whatsapp-manager', {
        body: {
          action: 'update_status',
          status: status,
          error: error,
        },
      });
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const getCurrentSession = (): WhatsAppSession | undefined => {
    return sessions.length > 0 ? sessions[0] : undefined;
  };

  const isConnected = (): boolean => {
    const session = getCurrentSession();
    return session?.connection_status === 'connected';
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!businessId) return;

    fetchSessions();

    // Clean up existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    channelRef.current = supabase
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
          console.log('WhatsApp session changed, refetching...');
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [businessId]);

  const value: WhatsAppContextType = {
    sessions,
    loading,
    currentSession: getCurrentSession(),
    isConnected: isConnected(),
    createSession,
    sendMessage,
    updateSessionStatus,
  };

  return (
    <WhatsAppContext.Provider value={value}>
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsAppContext = (): WhatsAppContextType => {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error('useWhatsAppContext must be used within a WhatsAppProvider');
  }
  return context;
};