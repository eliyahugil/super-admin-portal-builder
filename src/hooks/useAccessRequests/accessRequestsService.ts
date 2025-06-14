
import { supabase } from '@/integrations/supabase/client';
import type { AccessRequestEnriched } from './types';

export const fetchAccessRequests = async (): Promise<AccessRequestEnriched[]> => {
  console.log('🔄 Fetching access requests...');
  
  const { data, error } = await supabase
    .from('user_access_requests')
    .select(`
      *,
      profiles:user_id (
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
  return data || [];
};
