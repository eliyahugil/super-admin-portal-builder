import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppLog {
  id: string;
  session_id?: string;
  business_id: string;
  phone: string;
  category: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export const useWhatsAppLogs = (businessId: string) => {
  return useQuery({
    queryKey: ['whatsapp-logs', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_logs')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WhatsAppLog[];
    },
    enabled: !!businessId,
  });
};