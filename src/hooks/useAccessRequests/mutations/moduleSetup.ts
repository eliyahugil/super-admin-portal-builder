
import { supabase } from '@/integrations/supabase/client';

export const setupDefaultModules = async (
  businessId: string,
  adminUserId: string
): Promise<void> => {
  console.log('🔄 Setting up default modules for new business...');
  
  // Get default modules that should be enabled
  const { data: defaultModules } = await supabase
    .from('modules_config')
    .select('module_key')
    .eq('default_visible', true)
    .eq('enabled_by_superadmin', true);

  if (defaultModules && defaultModules.length > 0) {
    const moduleConfigs = defaultModules.map(module => ({
      business_id: businessId,
      module_key: module.module_key,
      is_enabled: true,
      enabled_by: adminUserId,
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
};
