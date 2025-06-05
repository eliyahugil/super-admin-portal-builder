
import { supabase } from '@/integrations/supabase/client';

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
};

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
  
  // Hebrew word mappings
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
  // Check if user is super admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profile?.role === 'super_admin') {
    return 0; // Super admin gets customer number 0
  }

  // For regular users, get their business and generate next customer number
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', userId)
    .single();

  if (!business) {
    throw new Error('No business found for user');
  }

  // Get the next customer number for this business
  const { data: result, error } = await supabase
    .rpc('get_next_customer_number', { business_id_param: business.id });

  if (error) {
    throw error;
  }

  return result || 1;
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
        // Use the SQL function we just created to drop the custom table
        const { data, error: dropTableError } = await supabase.rpc('drop_custom_table', { 
          table_name: tableName 
        });

        if (dropTableError) {
          console.warn('Could not drop custom table:', dropTableError);
          // Continue execution - table deletion is not critical
        } else {
          console.log('Successfully dropped custom table:', tableName, 'Result:', data);
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
