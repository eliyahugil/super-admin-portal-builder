

import { supabase } from '@/integrations/supabase/client';

// Define our own simple types to avoid Supabase type complexity
interface SimpleProfile {
  role: string;
}

interface SimpleBusiness {
  id: string;
}

interface SimpleModule {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  route?: string;
  is_custom: boolean;
  is_active: boolean;
  customer_number?: number;
}

// Module route mappings
export const moduleRouteMapping: Record<string, {
  name: string;
  description: string;
  icon: string;
  subModules?: Record<string, { name: string; description: string }>;
}> = {
  'employees': {
    name: 'ניהול עובדים',
    description: 'ניהול מידע עובדים, נוכחות ומשמרות',
    icon: '👥',
    subModules: {
      'employee-files': { name: 'קבצי עובדים', description: 'ניהול מסמכים וקבצים' },
      'attendance': { name: 'ניהול נוכחות', description: 'מעקב נוכחות ושעות עבודה' },
      'employee-requests': { name: 'בקשות עובדים', description: 'ניהול בקשות ואישורים' },
      'employee-docs': { name: 'מסמכים חתומים', description: 'מסמכים וטפסים חתומים דיגיטלית' },
      'shifts': { name: 'ניהול משמרות', description: 'תכנון וניהול משמרות' },
    }
  },
  'branches': {
    name: 'ניהול סניפים',
    description: 'ניהול סניפים ומיקומים',
    icon: '🏢',
    subModules: {
      'branch-roles': { name: 'תפקידי סניף', description: 'ניהול תפקידים בסניף' },
    }
  }
} as const;

// Parse module route information
export const parseModuleRoute = (route: string) => {
  const parts = route.split('/').filter(Boolean);
  
  if (parts.length >= 2 && parts[0] === 'modules') {
    const moduleRoute = parts[1];
    const subModule = parts[2] || null;
    
    return {
      moduleRoute,
      subModule,
      isValid: true
    };
  }
  
  return {
    moduleRoute: null,
    subModule: null,
    isValid: false
  };
};

// Generate table name for custom modules
export const generateTableName = (moduleName: string, moduleId: string, customerNumber: number): string => {
  const sanitized = moduleName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  return `custom_${sanitized}_${customerNumber}`;
};

// Generate route parameter
export const generateRoute = (moduleName: string): string => {
  return moduleName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Generate icon based on module name
export const generateIcon = (moduleName: string): string => {
  const name = moduleName.toLowerCase();
  
  const iconMappings: Record<string, string> = {
    // Hebrew mappings
    'לקוחות': '👥',
    'פרויקטים': '📊',
    'משימות': '✅',
    'חשבוניות': '💰',
    'מלאי': '📦',
    'הזמנות': '🛒',
    'דוחות': '📈',
    'ניהול': '⚙️',
    'מכירות': '💼',
    'שירות': '🛠️',
    'תמיכה': '💬',
    'חשבונות': '💳',
    'משאבים': '📚',
    'כספים': '💰',
    'תשלומים': '💳',
    
    // English mappings
    'customers': '👥',
    'projects': '📊',
    'tasks': '✅',
    'invoices': '💰',
    'inventory': '📦',
    'orders': '🛒',
    'reports': '📈',
    'management': '⚙️',
    'sales': '💼',
    'service': '🛠️',
    'support': '💬',
    'accounts': '💳',
    'resources': '📚',
    'finance': '💰',
    'payments': '💳',
  };

  for (const [key, icon] of Object.entries(iconMappings)) {
    if (name.includes(key)) {
      return icon;
    }
  }
  
  return '📋'; // Default icon
};

// Validate module name
export const validateModuleName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'שם המודול לא יכול להיות ריק' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'שם המודול חייב להכיל לפחות 2 תווים' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'שם המודול לא יכול להכיל יותר מ-50 תווים' };
  }

  return { isValid: true };
};

// Get customer number for user
export const getCustomerNumberForUser = async (userId: string): Promise<number> => {
  try {
    // Check if user is super admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    const userProfile = profile as unknown as SimpleProfile | null;

    if (userProfile?.role === 'super_admin') {
      return 0; // Super admin gets customer number 0
    }

    // For regular users, get their business and generate next customer number
    const { data, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();

    if (businessError) {
      console.error('Error fetching business:', businessError);
      throw businessError;
    }

    const userBusiness = data as unknown as SimpleBusiness | null;

    if (!userBusiness) {
      throw new Error('No business found for user');
    }

    // Get the next customer number for this business
    const { data: result, error } = await supabase
      .rpc('get_next_customer_number', { business_id_param: userBusiness.id });

    if (error) {
      console.error('Error getting next customer number:', error);
      throw error;
    }

    return Number(result) || 1;
  } catch (error) {
    console.error('Error in getCustomerNumberForUser:', error);
    throw error;
  }
};

// Clean up module data when deleting a custom module
export const cleanupModuleData = async (moduleId: string, tableName?: string): Promise<boolean> => {
  try {
    console.log('Starting cleanup for module:', moduleId, 'table:', tableName);

    // Remove module from all businesses
    const { error: businessModuleError } = await supabase
      .from('business_modules')
      .delete()
      .eq('module_id', moduleId);

    if (businessModuleError) {
      console.error('Error removing module from businesses:', businessModuleError);
      return false;
    }

    // If it's a custom module with a table, attempt to drop the table
    if (tableName) {
      try {
        // Use the SQL function to drop the custom table
        const { data, error: dropTableError } = await supabase.rpc('drop_custom_table', { 
          table_name: tableName 
        });

        if (dropTableError) {
          console.warn('Could not drop custom table:', dropTableError);
          // Continue execution - table deletion is not critical
        } else {
          console.log('Successfully dropped custom table:', tableName, 'Result:', Boolean(data));
        }
      } catch (tableError) {
        console.warn('Table deletion failed:', tableError);
        // Continue execution - table deletion is not critical
      }
    }

    return true;
  } catch (error) {
    console.error('Error in cleanupModuleData:', error);
    return false;
  }
};

// Check if user is super admin
export const isSuperAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }

    const profile = data as unknown as SimpleProfile | null;
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
      .maybeSingle();

    if (error) {
      console.error('Error fetching user business:', error);
      return null;
    }

    const business = data as unknown as SimpleBusiness | null;
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
  fields: any[],
  userId: string
): Promise<{ success: boolean; moduleId?: string; error?: string }> => {
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
      .single();

    if (moduleError) {
      console.error('Error creating module:', moduleError);
      return { success: false, error: moduleError.message };
    }

    const module = moduleData as unknown as SimpleModule;
    const finalTableName = generateTableName(moduleName, module.id, customerNumber);

    // Create custom table
    const { data: tableResult, error: tableError } = await supabase.rpc(
      'create_custom_module_table',
      {
        module_id_param: module.id,
        table_name_param: finalTableName,
        fields_config: fields
      }
    );

    if (tableError) {
      console.error('Error creating custom table:', tableError);
      // Clean up the module if table creation failed
      await supabase.from('modules').delete().eq('id', module.id);
      return { success: false, error: tableError.message };
    }

    return { success: true, moduleId: module.id };
  } catch (error) {
    console.error('Error in createCustomModuleWithTable:', error);
    return { success: false, error: String(error) };
  }
};

