
import { supabase } from '@/integrations/supabase/client';
import type { AccessRequestMutationParams, AccessRequestEnriched } from './types';

export const processAccessRequest = async (
  params: AccessRequestMutationParams,
  requests: AccessRequestEnriched[]
) => {
  const { requestId, action, reviewNotes, businessId } = params;
  
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
};
