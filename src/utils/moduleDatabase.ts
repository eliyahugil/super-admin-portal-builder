
import { supabase } from '@/integrations/supabase/client';
import type { ProfileRow, BusinessRow, CustomField, ModuleCreationResult } from './moduleTypes';
import { generateTableName, generateRoute, generateIcon } from './moduleGeneration';
import { validateModuleName } from './moduleValidation';

// Get customer number for user
export const getCustomerNumberForUser = async (userId: string): Promise<number> => {
  try {
    // Check if user is super admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle() as any;

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    const userProfile = profile as ProfileRow | null;

    if (userProfile?.role === 'super_admin') {
      return 0; // Super admin gets customer number 0
    }

    // For regular users, get their business and generate next customer number
    const { data, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle() as any;

    if (businessError) {
      console.error('Error fetching business:', businessError);
      throw businessError;
    }

    const userBusiness = data as BusinessRow | null;

    if (!userBusiness) {
      throw new Error('No business found for user');
    }

    // Get the next customer number for this business
    const rpcResult = await (supabase as any).rpc('get_next_customer_number', { 
      business_id_param: userBusiness.id 
    });

    if (rpcResult.error) {
      console.error('Error getting next customer number:', rpcResult.error);
      throw rpcResult.error;
    }

    return Number(rpcResult.data) || 1;
  } catch (error) {
    console.error('Error in getCustomerNumberForUser:', error);
    throw error;
  }
};

// Check if user is super admin
export const isSuperAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle() as any;

    if (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }

    const profile = data as ProfileRow | null;
    return profile?.role === 'super_admin';
  } catch (error) {
    console.error('Error in isSuperAdmin:', error);
    return false;
  }
};

// Get user business ID
export const getUserBusinessId = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle() as any;

    if (error) {
      console.error('Error fetching user business:', error);
      return null;
    }

    const business = data as BusinessRow | null;
    return business?.id || null;
  } catch (error) {
    console.error('Error in getUserBusinessId:', error);
    return null;
  }
};

// Create custom module with table
export const createCustomModuleWithTable = async (
  moduleName: string,
  description: string,
  fields: CustomField[],
  userId: string
): Promise<ModuleCreationResult> => {
  try {
    const customerNumber = await getCustomerNumberForUser(userId);
    const route = generateRoute(moduleName);
    const icon = generateIcon(moduleName);
    const tableName = generateTableName(moduleName, 'temp', customerNumber);

    // Create module record
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .insert({
        name: moduleName,
        description,
        icon,
        route,
        is_custom: true,
        is_active: true,
        customer_number: customerNumber
      })
      .select()
      .single() as any;

    if (moduleError) {
      console.error('Error creating module:', moduleError);
      return { success: false, error: moduleError.message };
    }

    const module = moduleData as any;
    const finalTableName = generateTableName(moduleName, module.id, customerNumber);

    // Create custom table
    const tableResult = await (supabase as any).rpc(
      'create_custom_module_table',
      {
        module_id_param: module.id,
        table_name_param: finalTableName,
        fields_config: fields
      }
    );

    if (tableResult.error) {
      console.error('Error creating custom table:', tableResult.error);
      // Clean up the module if table creation failed
      await (supabase as any).from('modules').delete().eq('id', module.id);
      return { success: false, error: tableResult.error.message };
    }

    return { success: true, moduleId: module.id };
  } catch (error) {
    console.error('Error in createCustomModuleWithTable:', error);
    return { success: false, error: String(error) };
  }
};
