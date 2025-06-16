
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EmployeeChatMessage {
  id: string;
  employee_id: string;
  sender_id: string;
  message_content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  employee?: {
    first_name: string;
    last_name: string;
  };
  sender?: {
    full_name: string;
  };
}

export const useEmployeeChatMessages = (employeeId: string | null) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('🔍 useEmployeeChatMessages - Employee ID:', employeeId);
  console.log('🔍 useEmployeeChatMessages - Current profile:', profile?.id, profile?.role);

  // Fetch messages for specific employee
  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['employee-chat-messages', employeeId],
    queryFn: async (): Promise<EmployeeChatMessage[]> => {
      if (!employeeId) {
        console.log('❌ No employee ID provided');
        return [];
      }
      
      console.log('🔄 Fetching messages for employee:', employeeId);
      
      const { data, error } = await supabase
        .from('employee_chat_messages')
        .select(`
          *,
          employee:employees(first_name, last_name),
          sender:profiles(full_name)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching employee chat messages:', error);
        throw error;
      }

      console.log('✅ Successfully fetched messages:', data?.length || 0);
      return data || [];
    },
    enabled: !!employeeId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ employeeId, content }: { employeeId: string; content: string }) => {
      if (!profile?.id) {
        throw new Error('User not authenticated');
      }

      console.log('📤 Sending message to employee:', employeeId, 'Content:', content);

      const { data, error } = await supabase
        .from('employee_chat_messages')
        .insert({
          employee_id: employeeId,
          sender_id: profile.id,
          message_content: content,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }

      console.log('✅ Message sent successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-chat-messages', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee-chat-unread-counts'] });
    },
    onError: (error) => {
      console.error('❌ Error sending message:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בשליחת ההודעה',
        variant: 'destructive',
      });
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      console.log('📖 Marking messages as read:', messageIds);
      
      const { error } = await supabase
        .from('employee_chat_messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) {
        console.error('❌ Error marking messages as read:', error);
        throw error;
      }

      console.log('✅ Messages marked as read successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-chat-messages', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee-chat-unread-counts'] });
    },
  });

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
  };
};
