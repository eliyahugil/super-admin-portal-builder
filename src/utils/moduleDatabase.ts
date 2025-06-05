import { supabase } from '@/integrations/supabase/client';
import type { ProfileRow, BusinessRow, CustomField, ModuleCreationResult, SubModule } from './moduleTypes';
import { generateTableName, generateRoute, generateIcon } from './moduleGeneration';
import { validateModuleName } from './moduleValidation';

// Get customer number for user
export const getCustomerNumberForUser = async (userId: string): Promise<number> => {
  try {
    // Check if user is super admin
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    const userProfile = profile as ProfileRow | null;

    if (userProfile?.role === 'super_admin') {
      return 0; // Super admin gets customer number 0
    }

    // For regular users, get their business and generate next customer number
    const { data, error: businessError } = await (supabase as any)
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();

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
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

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
    const { data, error } = await (supabase as any)
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();

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

// Create sub-modules for a module
export const createSubModules = async (
  moduleId: string,
  subModules: SubModule[]
): Promise<boolean> => {
  try {
    if (subModules.length === 0) return true;

    const subModuleInserts = subModules.map(subModule => ({
      module_id: moduleId,
      name: subModule.name,
      description: subModule.description,
      route: subModule.route,
      icon: subModule.icon || '📋',
      display_order: subModule.display_order
    }));

    const { error } = await (supabase as any)
      .from('sub_modules')
      .insert(subModuleInserts);

    if (error) {
      console.error('Error creating sub-modules:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createSubModules:', error);
    return false;
  }
};

// Add module to business_modules table
export const addModuleToBusiness = async (
  businessId: string,
  moduleId: string
): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('business_modules')
      .insert({
        business_id: businessId,
        module_id: moduleId,
        is_enabled: true
      });

    if (error) {
      console.error('Error adding module to business:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addModuleToBusiness:', error);
    return false;
  }
};

// Enhanced module creation with sub-modules and business integration
export const createCustomModuleWithTable = async (
  moduleName: string,
  description: string,
  fields: CustomField[],
  subModules: SubModule[],
  userId: string
): Promise<ModuleCreationResult> => {
  try {
    const customerNumber = await getCustomerNumberForUser(userId);
    const route = generateRoute(moduleName);
    const icon = generateIcon(moduleName);
    const tableName = generateTableName(moduleName, 'temp', customerNumber);

    // Create module record
    const { data: moduleData, error: moduleError } = await (supabase as any)
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
      .single();

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

    // Create sub-modules if provided
    if (subModules.length > 0) {
      const subModulesSuccess = await createSubModules(module.id, subModules);
      if (!subModulesSuccess) {
        console.warn('Sub-modules creation failed, but continuing...');
      }
    }

    // Add module to user's business
    const businessId = await getUserBusinessId(userId);
    if (businessId) {
      const businessSuccess = await addModuleToBusiness(businessId, module.id);
      if (!businessSuccess) {
        console.warn('Failed to add module to business, but continuing...');
      }
    }

    return { success: true, moduleId: module.id };
  } catch (error) {
    console.error('Error in createCustomModuleWithTable:', error);
    return { success: false, error: String(error) };
  }
};

// Create custom module with table
export const createCustomModuleWithTableOld = async (
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
    const { data: moduleData, error: moduleError } = await (supabase as any)
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
      .single();

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
