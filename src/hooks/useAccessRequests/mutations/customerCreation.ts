
import { supabase } from '@/integrations/supabase/client';
import type { AccessRequestEnriched } from '../types';

export const createCustomerRecord = async (
  businessId: string,
  userProfile: AccessRequestEnriched['profiles']
): Promise<void> => {
  console.log('👤 Creating customer record for user in business:', businessId);
  
  const { error: customerError } = await supabase
    .from('customers')
    .insert({
      business_id: businessId,
      name: userProfile?.full_name || userProfile?.email || 'לקוח חדש',
      email: userProfile?.email,
      customer_type: 'individual',
      notes: `נוצר מבקשת גישה - ${new Date().toLocaleDateString('he-IL')}`,
      is_active: true
    });

  if (customerError) {
    console.warn('⚠️ Error creating customer record:', customerError);
  }
};
