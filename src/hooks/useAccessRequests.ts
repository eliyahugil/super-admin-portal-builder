
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AccessRequest, AccessRequestMutationParams } from '@/types/access-request';

export const useAccessRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['access-requests'],
    queryFn: async (): Promise<AccessRequest[]> => {
      const { data, error } = await supabase
        .from('user_access_requests')
        .select(`
          id,
          user_id,
          requested_business_id,
          requested_role,
          request_reason,
          status,
          created_at,
          profiles!user_id(email, full_name),
          businesses!requested_business_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []) as AccessRequest[];
    },
  });

  const handleRequestMutation = useMutation({
    mutationFn: async ({ requestId, action, reviewNotes }: AccessRequestMutationParams) => {
      const request = requests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      // Update the access request status
      const { error: updateError } = await supabase
        .from('user_access_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          review_notes: reviewNotes
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, create user_business relationship and update profile
      if (action === 'approve' && request.requested_business_id) {
        // Create user_business relationship
        const { error: businessError } = await supabase
          .from('user_businesses')
          .insert({
            user_id: request.user_id,
            business_id: request.requested_business_id,
            role: 'member'
          });

        if (businessError) {
          console.warn('Error creating user_business relationship:', businessError);
        }

        // Update user profile with business_id and role
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            business_id: request.requested_business_id,
            role: request.requested_role as 'super_admin' | 'business_admin' | 'business_user'
          })
          .eq('id', request.user_id);

        if (profileError) {
          console.warn('Error updating user profile:', profileError);
        }
      }

      return { action, requestId };
    },
    onSuccess: (data) => {
      toast({
        title: data.action === 'approve' ? 'בקשה אושרה' : 'בקשה נדחתה',
        description: data.action === 'approve' 
          ? 'המשתמש קיבל גישה לעסק'
          : 'הבקשה נדחתה',
      });
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    },
    onError: (error: any) => {
      console.error('Error handling request:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעבד את הבקשה',
        variant: 'destructive',
      });
    }
  });

  return {
    requests,
    isLoading,
    handleRequestMutation
  };
};
