
import { supabase } from '@/integrations/supabase/client';
import type { AccessRequestEnriched } from './types';

export const fetchAccessRequests = async (): Promise<AccessRequestEnriched[]> => {
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

  // Create lookup maps with proper typing
  const profilesMap = new Map<string, any>(
    (profilesData ?? []).map(p => [p.id, p] as [string, any])
  );
  const businessesMap = new Map<string, any>(
    (businessesData ?? []).map(b => [b.id, b] as [string, any])
  );

  // Combine the data
  const enrichedRequests: AccessRequestEnriched[] = requestsData.map(request => ({
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
};
