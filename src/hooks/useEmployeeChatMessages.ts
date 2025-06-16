import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { EmployeeChatMessage } from '@/types/employee-chat';

export const useEmployeeChatMessages = (employeeId: string | null = null, groupId: string | null = null) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('🔍 useEmployeeChatMessages - Employee ID:', employeeId, 'Group ID:', groupId);
  console.log('🔍 useEmployeeChatMessages - Current profile:', profile?.id, profile?.role);

  // Fetch messages for specific employee or group
  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['employee-chat-messages', employeeId, groupId],
    queryFn: async (): Promise<EmployeeChatMessage[]> => {
      if (!employeeId && !groupId) {
        console.log('❌ No employee ID or group ID provided');
        return [];
      }
      
      console.log('🔄 Fetching messages for:', employeeId ? `employee ${employeeId}` : `group ${groupId}`);
      
      let query = supabase
        .from('employee_chat_messages')
        .select(`
          *,
          employee:employees(id, first_name, last_name),
          sender:profiles(id, full_name, email),
          group:employee_chat_groups(name, group_type)
        `)
        .order('created_at', { ascending: true });

      // Filter by employee for direct messages
      if (employeeId) {
        query = query.eq('employee_id', employeeId).eq('message_type', 'direct');
      }
      
      // Filter by group for group messages
      if (groupId) {
        query = query.eq('group_id', groupId).eq('message_type', 'group');
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching employee chat messages:', error);
        throw error;
      }

      console.log('✅ Successfully fetched messages:', data?.length || 0);
      return (data || []).map(item => ({
        ...item,
        message_type: item.message_type as 'direct' | 'group'
      }));
    },
    enabled: !!(employeeId || groupId),
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ employeeId: targetEmployeeId, groupId: targetGroupId, content }: { 
      employeeId?: string; 
      groupId?: string; 
      content: string 
    }) => {
      if (!profile?.id) {
        throw new Error('User not authenticated');
      }

      console.log('📤 Sending message:', {
        targetEmployeeId,
        targetGroupId,
        content,
        messageType: targetGroupId ? 'group' : 'direct'
      });

      const messageData: any = {
        sender_id: profile.id,
        message_content: content,
        message_type: targetGroupId ? 'group' : 'direct'
      };

      if (targetEmployeeId) {
        messageData.employee_id = targetEmployeeId;
      }

      if (targetGroupId) {
        messageData.group_id = targetGroupId;
      }

      const { data, error } = await supabase
        .from('employee_chat_messages')
        .insert(messageData)
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
      queryClient.invalidateQueries({ queryKey: ['employee-chat-messages', employeeId, groupId] });
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
      queryClient.invalidateQueries({ queryKey: ['employee-chat-messages', employeeId, groupId] });
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
