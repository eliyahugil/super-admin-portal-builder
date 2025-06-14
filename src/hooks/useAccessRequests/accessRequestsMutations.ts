
import { supabase } from '@/integrations/supabase/client';
import type { AccessRequestMutationParams, AccessRequestEnriched } from './types';

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

  let finalBusinessId = null;
  let userRole = request.requested_role;

  // Handle different assignment types for approval
  if (action === 'approve' && assignmentData) {
    console.log('🔄 Processing assignment data:', assignmentData);

    switch (assignmentData.type) {
      case 'existing_business':
        finalBusinessId = assignmentData.businessId;
        userRole = request.requested_role; // Keep original requested role
        break;

      case 'new_business':
        // Create new business
        console.log('🏢 Creating new business:', assignmentData.newBusinessData);
        const { data: newBusiness, error: businessError } = await supabase
          .from('businesses')
          .insert({
            name: assignmentData.newBusinessData.name,
            description: assignmentData.newBusinessData.description,
            contact_email: assignmentData.newBusinessData.contactEmail,
            contact_phone: assignmentData.newBusinessData.contactPhone,
            owner_id: request.user_id,
            is_active: true
          })
          .select()
          .single();

        if (businessError) {
          console.error('❌ Error creating business:', businessError);
          throw businessError;
        }

        finalBusinessId = newBusiness.id;
        userRole = 'business_admin'; // Owner of new business becomes admin
        console.log('✅ New business created:', newBusiness);
        break;

      case 'customer':
        userRole = 'business_user';
        // Create customer record
        console.log('👤 Creating customer record for user:', request.user_id);
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            name: request.profiles?.full_name || request.profiles?.email || 'לקוח חדש',
            email: request.profiles?.email,
            customer_type: 'individual',
            notes: `נוצר מבקשת גישה - ${new Date().toLocaleDateString('he-IL')}`,
            is_active: true
          });

        if (customerError) {
          console.warn('⚠️ Error creating customer record:', customerError);
        }
        break;

      case 'employee':
        userRole = 'business_user';
        console.log('👨‍💼 User will be assigned as employee');
        break;

      case 'other':
        userRole = 'business_user';
        console.log('🔧 Custom user type:', assignmentData.customUserType);
        break;
    }
  }

  // Update the access request status
  const updateData: any = {
    status: action === 'approve' ? 'approved' : 'rejected',
    reviewed_at: new Date().toISOString(),
    reviewed_by: user.id,
    review_notes: reviewNotes || (assignmentData ? `שויך כ${getAssignmentTypeLabel(assignmentData.type)}` : null)
  };

  // If approving and we have assignment data, update the requested business
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

  // If approved, update user profile and create business relationship
  if (action === 'approve') {
    console.log('🔄 Updating user profile for approval...');
    
    // Update user profile with business_id and role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        business_id: finalBusinessId,
        role: userRole as 'super_admin' | 'business_admin' | 'business_user'
      })
      .eq('id', request.user_id);

    if (profileError) {
      console.warn('⚠️ Error updating user profile:', profileError);
    }

    // Create user_business relationship if we have a business
    if (finalBusinessId) {
      console.log('🔄 Creating user-business relationship...');
      
      const { error: businessError } = await supabase
        .from('user_businesses')
        .insert({
          user_id: request.user_id,
          business_id: finalBusinessId,
          role: userRole === 'business_admin' ? 'admin' : 'member'
        });

      if (businessError) {
        console.warn('⚠️ Error creating user_business relationship:', businessError);
      }
    }

    // Enable default modules for business if it's a new business
    if (assignmentData?.type === 'new_business' && finalBusinessId) {
      console.log('🔄 Setting up default modules for new business...');
      
      // Get default modules that should be enabled
      const { data: defaultModules } = await supabase
        .from('modules_config')
        .select('module_key')
        .eq('default_visible', true)
        .eq('enabled_by_superadmin', true);

      if (defaultModules && defaultModules.length > 0) {
        const moduleConfigs = defaultModules.map(module => ({
          business_id: finalBusinessId,
          module_key: module.module_key,
          is_enabled: true,
          enabled_by: user.id,
          enabled_at: new Date().toISOString()
        }));

        const { error: modulesError } = await supabase
          .from('business_module_config')
          .insert(moduleConfigs);

        if (modulesError) {
          console.warn('⚠️ Error setting up default modules:', modulesError);
        } else {
          console.log('✅ Default modules set up for new business');
        }
      }
    }
  }

  console.log('✅ Request mutation completed successfully');
  return { action, requestId, assignmentType: assignmentData?.type };
};

function getAssignmentTypeLabel(type: string): string {
  switch (type) {
    case 'existing_business': return 'עסק קיים';
    case 'new_business': return 'עסק חדש';
    case 'customer': return 'לקוח';
    case 'employee': return 'עובד';
    case 'other': return 'סוג מותאם';
    default: return 'לא מוגדר';
  }
}
