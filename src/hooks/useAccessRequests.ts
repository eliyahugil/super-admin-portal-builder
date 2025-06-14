
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AccessRequest } from '@/types/access-request';

interface AccessRequestMutationParams {
  requestId: string;
  action: 'approve' | 'reject';
  reviewNotes?: string;
  businessId?: string; // Add business ID for assignment
}

export const useAccessRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, error, refetch } = useQuery({
    queryKey: ['access-requests'],
    queryFn: async (): Promise<AccessRequest[]> => {
      console.log('🔄 Fetching access requests...');
      
      // First, get the access requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('user_access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('❌ Error fetching access requests:', requestsError);
        throw requestsError;
      }

      if (!requestsData || requestsData.length === 0) {
        console.log('📋 No access requests found');
        return [];
      }

      console.log('📋 Found access requests:', requestsData.length);

      // Get unique user IDs and business IDs for batch fetching
      const userIds = [...new Set(requestsData.map(req => req.user_id))];
      const businessIds = [...new Set(requestsData.map(req => req.requested_business_id).filter(Boolean))];

      // Fetch profiles data
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      // Fetch businesses data
      const { data: businessesData } = businessIds.length > 0 ? await supabase
        .from('businesses')
        .select('id, name')
        .in('id', businessIds) : { data: [] };

      // Create lookup maps
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      const businessesMap = new Map(businessesData?.map(b => [b.id, b]) || []);

      // Combine the data
      const enrichedRequests: AccessRequest[] = requestsData.map(request => ({
        id: request.id,
        user_id: request.user_id,
        requested_business_id: request.requested_business_id,
        requested_role: request.requested_role as 'super_admin' | 'business_admin' | 'business_user',
        request_reason: request.request_reason,
        status: request.status as 'pending' | 'approved' | 'rejected',
        reviewed_by: request.reviewed_by,
        reviewed_at: request.reviewed_at,
        review_notes: request.review_notes,
        created_at: request.created_at,
        profiles: profilesMap.get(request.user_id) || null,
        businesses: request.requested_business_id ? businessesMap.get(request.requested_business_id) || null : null
      }));

      console.log('✅ Enriched access requests:', enrichedRequests.length);
      console.log('📊 Sample request:', enrichedRequests[0]);
      
      return enrichedRequests;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Log any errors
  if (error) {
    console.error('❌ useAccessRequests error:', error);
  }

  const handleRequestMutation = useMutation({
    mutationFn: async ({ requestId, action, reviewNotes, businessId }: AccessRequestMutationParams) => {
      console.log('🔄 Processing request mutation:', { requestId, action, reviewNotes, businessId });
      
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        console.error('❌ Request not found:', requestId);
        throw new Error('Request not found');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update the access request status
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        review_notes: reviewNotes
      };

      // If approving and business ID provided, update the requested business
      if (action === 'approve' && businessId) {
        updateData.requested_business_id = businessId;
      }

      const { error: updateError } = await supabase
        .from('user_access_requests')
        .update(updateData)
        .eq('id', requestId);

      if (updateError) {
        console.error('❌ Error updating request:', updateError);
        throw updateError;
      }

      // If approved, create user_business relationship and update profile
      if (action === 'approve') {
        const finalBusinessId = businessId || request.requested_business_id;
        
        if (finalBusinessId) {
          console.log('🔄 Creating user-business relationship...');
          
          // Create user_business relationship
          const { error: businessError } = await supabase
            .from('user_businesses')
            .insert({
              user_id: request.user_id,
              business_id: finalBusinessId,
              role: 'member'
            });

          if (businessError) {
            console.warn('⚠️ Error creating user_business relationship:', businessError);
          }

          // Update user profile with business_id and role
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              business_id: finalBusinessId,
              role: request.requested_role as 'super_admin' | 'business_admin' | 'business_user'
            })
            .eq('id', request.user_id);

          if (profileError) {
            console.warn('⚠️ Error updating user profile:', profileError);
          }
        }
      }

      console.log('✅ Request mutation completed successfully');
      return { action, requestId };
    },
    onSuccess: (data) => {
      console.log('✅ Mutation success:', data);
      toast({
        title: data.action === 'approve' ? 'בקשה אושרה' : 'בקשה נדחתה',
        description: data.action === 'approve' 
          ? 'המשתמש קיבל גישה לעסק'
          : 'הבקשה נדחתה',
      });
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      // Force refetch
      refetch();
    },
    onError: (error: any) => {
      console.error('❌ Error handling request:', error);
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
    error,
    refetch,
    handleRequestMutation
  };
};
