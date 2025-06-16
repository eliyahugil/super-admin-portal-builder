import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { EmployeeChatGroup, EmployeeChatGroupMember } from '@/types/employee-chat';

export const useEmployeeChatGroups = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('🔍 useEmployeeChatGroups - Current profile:', profile?.id, profile?.role);

  // Fetch all groups for the current business
  const {
    data: groups = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['employee-chat-groups', profile?.business_id],
    queryFn: async (): Promise<EmployeeChatGroup[]> => {
      if (!profile?.business_id && profile?.role !== 'super_admin') {
        console.log('❌ No business ID available');
        return [];
      }
      
      console.log('🔄 Fetching chat groups...');
      
      let query = supabase
        .from('employee_chat_groups')
        .select(`
          *,
          members:employee_chat_group_members(
            id,
            group_id,
            employee_id,
            added_by,
            added_at,
            is_admin,
            employee:employees(
              id,
              first_name,
              last_name,
              email,
              phone,
              employee_type
            )
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // For non-super admins, filter by business
      if (profile?.role !== 'super_admin' && profile?.business_id) {
        query = query.eq('business_id', profile.business_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching chat groups:', error);
        throw error;
      }

      console.log('✅ Successfully fetched groups:', data?.length || 0);
      return (data || []).map(group => ({
        ...group,
        group_type: group.group_type as 'general' | 'custom' | 'department',
        member_count: group.members?.length || 0
      }));
    },
    enabled: !!profile,
  });

  // Create new group mutation
  const createGroupMutation = useMutation({
    mutationFn: async ({ name, description, employeeIds }: { 
      name: string; 
      description?: string; 
      employeeIds: string[] 
    }) => {
      if (!profile?.id || !profile?.business_id) {
        throw new Error('User profile not available');
      }

      console.log('📤 Creating new group:', name, 'with', employeeIds.length, 'members');

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('employee_chat_groups')
        .insert({
          business_id: profile.business_id,
          name,
          description,
          created_by: profile.id,
          group_type: 'custom'
        })
        .select()
        .single();

      if (groupError) {
        console.error('❌ Error creating group:', groupError);
        throw groupError;
      }

      // Add members to the group
      if (employeeIds.length > 0) {
        const members = employeeIds.map(employeeId => ({
          group_id: group.id,
          employee_id: employeeId,
          added_by: profile.id,
          is_admin: false
        }));

        const { error: membersError } = await supabase
          .from('employee_chat_group_members')
          .insert(members);

        if (membersError) {
          console.error('❌ Error adding members:', membersError);
          throw membersError;
        }
      }

      console.log('✅ Group created successfully:', group);
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-chat-groups'] });
      toast({
        title: 'הצלחה',
        description: 'הקבוצה נוצרה בהצלחה',
      });
    },
    onError: (error) => {
      console.error('❌ Error creating group:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה ביצירת הקבוצה',
        variant: 'destructive',
      });
    },
  });

  // Add member to group mutation
  const addMemberMutation = useMutation({
    mutationFn: async ({ groupId, employeeId }: { groupId: string; employeeId: string }) => {
      if (!profile?.id) {
        throw new Error('User not authenticated');
      }

      console.log('📤 Adding member to group:', groupId, employeeId);

      const { data, error } = await supabase
        .from('employee_chat_group_members')
        .insert({
          group_id: groupId,
          employee_id: employeeId,
          added_by: profile.id,
          is_admin: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding member:', error);
        throw error;
      }

      console.log('✅ Member added successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-chat-groups'] });
      toast({
        title: 'הצלחה',
        description: 'החבר נוסף לקבוצה',
      });
    },
    onError: (error) => {
      console.error('❌ Error adding member:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בהוספת החבר לקבוצה',
        variant: 'destructive',
      });
    },
  });

  return {
    groups,
    isLoading,
    error,
    createGroup: createGroupMutation.mutate,
    isCreatingGroup: createGroupMutation.isPending,
    addMember: addMemberMutation.mutate,
    isAddingMember: addMemberMutation.isPending,
  };
};
