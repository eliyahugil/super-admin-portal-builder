
import { supabase } from '@/integrations/supabase/client';
import type { AccessRequestEnriched } from './types';

export const fetchAccessRequests = async (): Promise<AccessRequestEnriched[]> => {
  console.log('🔄 Fetching access requests...');
  
  // Step 1: Fetch all access requests
  const { data: requestsData, error: requestsError } = await supabase
    .from('user_access_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (requestsError) {
    console.error('❌ Error fetching access requests:', requestsError);
    throw requestsError;
  }

  if (!requestsData || requestsData.length === 0) {
    console.log('✅ No access requests found');
    return [];
  }

  // Step 2: Get unique user IDs
  const userIds = [...new Set(requestsData.map(r => r.user_id))].filter(Boolean);
  
  let profilesData: any[] = [];
  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', userIds);

    if (profilesError) {
      console.warn('⚠️ Error fetching profiles:', profilesError);
    } else {
      profilesData = profiles || [];
    }
  }

  // Step 3: Get business data for requests that have requested_business_id
  const businessIds = [...new Set(requestsData
    .map(r => r.requested_business_id)
    .filter(Boolean)
  )];
  
  let businessesData: any[] = [];
  if (businessIds.length > 0) {
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('id, name')
      .in('id', businessIds);

    if (businessesError) {
      console.warn('⚠️ Error fetching businesses:', businessesError);
    } else {
      businessesData = businesses || [];
    }
  }

  // Step 4: Create maps for efficient lookup
  const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));
  const businessesMap = new Map(businessesData.map(business => [business.id, business]));

  // Step 5: Merge data and convert to proper type
  const accessRequests: AccessRequestEnriched[] = requestsData.map(request => ({
    ...request,
    status: request.status as 'pending' | 'approved' | 'rejected',
    profiles: profilesMap.get(request.user_id) || null,
    businesses: request.requested_business_id ? businessesMap.get(request.requested_business_id) || null : null,
  }));

  console.log('✅ Fetched access requests:', accessRequests.length);
  return accessRequests;
};
