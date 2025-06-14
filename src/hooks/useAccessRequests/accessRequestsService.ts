
import { supabase } from '@/integrations/supabase/client';
import type { AccessRequestEnriched } from './types';

export const fetchAccessRequests = async (): Promise<AccessRequestEnriched[]> => {
  console.log('🔄 Fetching access requests...');
  
  const { data, error } = await supabase
    .from('user_access_requests')
    .select(`
      *,
      profiles:profiles!user_access_requests_user_id_fkey (
        email,
        full_name,
        phone
      ),
      businesses:requested_business_id (
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching access requests:', error);
    throw error;
  }

  console.log('✅ Fetched access requests:', data?.length || 0);
  
  // Convert data to proper type
  const accessRequests: AccessRequestEnriched[] = (data || []).map(request => ({
    ...request,
    status: request.status as 'pending' | 'approved' | 'rejected'
  }));
  
  return accessRequests;
};
