
import { supabase } from '@/integrations/supabase/client';
import type { AccessRequestMutationParams } from '../types';

export const createNewBusiness = async (
  assignmentData: NonNullable<AccessRequestMutationParams['assignmentData']>,
  userId: string
): Promise<string> => {
  if (assignmentData.type !== 'new_business' || !assignmentData.newBusinessData) {
    throw new Error('Invalid assignment data for new business creation');
  }

  console.log('🏢 Creating new business:', assignmentData.newBusinessData);
  
  const { data: newBusiness, error: businessError } = await supabase
    .from('businesses')
    .insert({
      name: assignmentData.newBusinessData.name,
      description: assignmentData.newBusinessData.description,
      contact_email: assignmentData.newBusinessData.contactEmail,
      contact_phone: assignmentData.newBusinessData.contactPhone,
      owner_id: userId,
      is_active: true
    })
    .select()
    .single();

  if (businessError) {
    console.error('❌ Error creating business:', businessError);
    throw businessError;
  }

  console.log('✅ New business created:', newBusiness);
  return newBusiness.id;
};
