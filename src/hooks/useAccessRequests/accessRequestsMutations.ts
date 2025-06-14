
import { supabase } from '@/integrations/supabase/client';
import type { AccessRequestMutationParams, AccessRequestEnriched } from './types';
import { resolveAssignmentType, getAssignmentTypeLabel } from './mutations/assignmentTypeResolver';
import { updateAccessRequestStatus } from './mutations/requestUpdate';
import { updateUserProfile, createUserBusinessRelationship } from './mutations/userProfileUpdate';
import { setupDefaultModules } from './mutations/moduleSetup';

export const processAccessRequest = async (
  params: AccessRequestMutationParams,
  requests: AccessRequestEnriched[]
) => {
  const { requestId, action, reviewNotes, assignmentData } = params;
  
  console.log('🔄 Processing request mutation:', { requestId, action, reviewNotes, assignmentData });
  
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

  // Handle assignment for approval
  const { businessId: finalBusinessId, userRole } = await resolveAssignmentType(
    action === 'approve' ? assignmentData : undefined,
    request,
    request.requested_role
  );

  // Generate review notes
  const finalReviewNotes = reviewNotes || 
    (assignmentData ? `שויך כ${getAssignmentTypeLabel(assignmentData.type)}` : null);

  // Update the access request status
  await updateAccessRequestStatus(
    requestId,
    action,
    user.id,
    finalReviewNotes,
    finalBusinessId
  );

  // If approved, update user profile and create business relationship
  if (action === 'approve') {
    await updateUserProfile(request.user_id, finalBusinessId, userRole);

    // Create user_business relationship if we have a business
    if (finalBusinessId) {
      await createUserBusinessRelationship(request.user_id, finalBusinessId, userRole);
    }

    // Enable default modules for business if it's a new business
    if (assignmentData?.type === 'new_business' && finalBusinessId) {
      await setupDefaultModules(finalBusinessId, user.id);
    }
  }

  console.log('✅ Request mutation completed successfully');
  return { action, requestId, assignmentType: assignmentData?.type };
};
