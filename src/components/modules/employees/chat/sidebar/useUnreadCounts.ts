
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadCounts = () => {
  return useQuery({
    queryKey: ['employee-chat-unread-counts'],
    queryFn: async () => {
      console.log('🔄 Fetching unread message counts...');
      
      const { data, error } = await supabase
        .from('employee_chat_messages')
        .select('employee_id, group_id, is_read, message_type')
        .eq('is_read', false);

      if (error) {
        console.error('❌ Error fetching unread counts:', error);
        return {};
      }

      // Count unread messages per employee and group
      const counts: Record<string, number> = {};
      data.forEach((message) => {
        if (message.message_type === 'direct' && message.employee_id) {
          const key = `employee_${message.employee_id}`;
          counts[key] = (counts[key] || 0) + 1;
        } else if (message.message_type === 'group' && message.group_id) {
          const key = `group_${message.group_id}`;
          counts[key] = (counts[key] || 0) + 1;
        }
      });

      console.log('✅ Unread counts:', counts);
      return counts;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
