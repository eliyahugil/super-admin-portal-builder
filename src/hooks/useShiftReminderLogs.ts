
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from './useBusiness';

export interface ShiftReminderLog {
  id: string;
  employee_id: string;
  business_id: string;
  sent_at: string;
  method: 'manual' | 'auto';
  status: 'success' | 'failed' | 'pending';
  message_content: string | null;
  phone_number: string | null;
  error_details: string | null;
  created_at: string;
  employee?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

export const useShiftReminderLogs = (limit: number = 50) => {
  const { business } = useBusiness();

  return useQuery({
    queryKey: ['shift-reminder-logs', business?.id, limit],
    queryFn: async () => {
      if (!business?.id) return [];

      const { data, error } = await supabase
        .from('shift_reminder_logs')
        .select(`
          *,
          employee:employees(first_name, last_name, phone)
        `)
        .eq('business_id', business.id)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching shift reminder logs:', error);
        throw error;
      }

      return data as ShiftReminderLog[];
    },
    enabled: !!business?.id,
  });
};
