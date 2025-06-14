
import { supabase } from '@/integrations/supabase/client';
import type { AccessRequestMutationParams } from '../types';

export const updateAccessRequestStatus = async (
  requestId: string,
  action: 'approve' | 'reject',
  reviewerId: string,
  reviewNotes?: string,
  finalBusinessId?: string | null
): Promise<void> => {
  const updateData: any = {
    status: action === 'approve' ? 'approved' : 'rejected',
    reviewed_at: new Date().toISOString(),
    reviewed_by: reviewerId,
    review_notes: reviewNotes
  };

  // If approving and we have a business, update the requested business
  if (action === 'approve' && finalBusinessId) {
    updateData.requested_business_id = finalBusinessId;
  }

  const { error: updateError } = await supabase
    .from('user_access_requests')
    .update(updateData)
    .eq('id', requestId);

  if (updateError) {
    console.error('❌ Error updating request:', updateError);
    throw updateError;
  }
};
