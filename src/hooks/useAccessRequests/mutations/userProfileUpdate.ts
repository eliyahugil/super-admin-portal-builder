
import { supabase } from '@/integrations/supabase/client';

export const updateUserProfile = async (
  userId: string,
  businessId: string | null,
  userRole: 'super_admin' | 'business_admin' | 'business_user'
): Promise<void> => {
  console.log('🔄 Updating user profile for approval...');
  
  // Update user profile with business_id and role
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      business_id: businessId,
      role: userRole
    })
    .eq('id', userId);

  if (profileError) {
    console.warn('⚠️ Error updating user profile:', profileError);
  }
};

export const createUserBusinessRelationship = async (
  userId: string,
  businessId: string,
  userRole: 'super_admin' | 'business_admin' | 'business_user'
): Promise<void> => {
  console.log('🔄 Creating user-business relationship...');
  
  const { error: businessError } = await supabase
    .from('user_businesses')
    .insert({
      user_id: userId,
      business_id: businessId,
      role: userRole === 'business_admin' ? 'admin' : 'member'
    });

  if (businessError) {
    console.warn('⚠️ Error creating user_business relationship:', businessError);
  }
};
