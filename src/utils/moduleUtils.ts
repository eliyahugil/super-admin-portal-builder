import { supabase } from '@/integrations/supabase/client';

// Mapping of Hebrew words to English for route generation
const hebrewToEnglishMapping: Record<string, string> = {
  // Business & Management
  'ניהול': 'management',
  'נהול': 'management', 
  'מודל': 'module',
  'מודול': 'module',
  'עובדים': 'employees',
  'עובד': 'employee',
  'לקוחות': 'customers',
  'לקוח': 'customer',
  'פרויקטים': 'projects',
  'פרויקט': 'project',
  'משימות': 'tasks',
  'משימה': 'task',
  'מכירות': 'sales',
  'מכירה': 'sale',
  'הזמנות': 'orders',
  'הזמנה': 'order',
  'מוצרים': 'products',
  'מוצר': 'product',
  'מלאי': 'inventory',
  'מחסן': 'warehouse',
  'משכורות': 'payroll',
  'משכורת': 'salary',
  'נוכחות': 'attendance',
  'משמרות': 'shifts',
  'משמרת': 'shift',
  'דיווחים': 'reports',
  'דיווח': 'report',
  'חשבונות': 'accounts',
  'חשבון': 'account',
  'חשבוניות': 'invoices',
  'חשבונית': 'invoice',
  'תשלומים': 'payments',
  'תשלום': 'payment',
  'ספקים': 'suppliers',
  'ספק': 'supplier',
  'התקשרויות': 'contracts',
  'התקשרות': 'contract',
  'אירועים': 'events',
  'אירוע': 'event',
  'פגישות': 'meetings',
  'פגישה': 'meeting',
  'קבצים': 'files',
  'קובץ': 'file',
  'מסמכים': 'documents',
  'מסמך': 'document',
  'תמיכה': 'support',
  'שירות': 'service',
  'הודעות': 'messages',
  'הודעה': 'message',
  'התראות': 'notifications',
  'התראה': 'notification',
  'הגדרות': 'settings',
  'הגדרה': 'setting',
  'משתמשים': 'users',
  'משתמש': 'user',
  'סניפים': 'branches',
  'סניף': 'branch',
  'מחלקות': 'departments',
  'מחלקה': 'department',
  'תקציב': 'budget',
  'תקציבים': 'budgets',
  'הוצאות': 'expenses',
  'הוצאה': 'expense',
  'רכישות': 'purchases',
  'רכישה': 'purchase',
  'חופשות': 'vacations',
  'חופשה': 'vacation',
  'אישורים': 'approvals',
  'אישור': 'approval',
  'בקשות': 'requests',
  'בקשה': 'request'
};

// Icon mapping based on Hebrew keywords
const hebrewToIconMapping: Record<string, string> = {
  // People & HR
  'עובדים': '👥',
  'עובד': '👤',
  'משתמשים': '👥',
  'משתמש': '👤',
  'נוכחות': '⏰',
  'משמרות': '🕐',
  'משמרת': '🕐',
  'משכורות': '💰',
  'משכורת': '💰',
  'חופשות': '🏖️',
  'חופשה': '🏖️',
  
  // Business & Sales
  'לקוחות': '👨‍💼',
  'לקוח': '👨‍💼',
  'מכירות': '💼',
  'מכירה': '💼',
  'הזמנות': '📋',
  'הזמנה': '📋',
  'ספקים': '🏢',
  'ספק': '🏢',
  'התקשרויות': '📝',
  'התקשרות': '📝',
  
  // Products & Inventory
  'מוצרים': '📦',
  'מוצר': '📦',
  'מלאי': '📊',
  'מחסן': '🏪',
  'רכישות': '🛒',
  'רכישה': '🛒',
  
  // Finance
  'חשבונות': '💳',
  'חשבון': '💳',
  'חשבוניות': '🧾',
  'חשבונית': '🧾',
  'תשלומים': '💵',
  'תשלום': '💵',
  'תקציב': '💰',
  'תקציבים': '💰',
  'הוצאות': '💸',
  'הוצאה': '💸',
  
  // Projects & Tasks
  'פרויקטים': '🚀',
  'פרויקט': '🚀',
  'משימות': '✅',
  'משימה': '✅',
  'דיווחים': '📈',
  'דיווח': '📈',
  
  // Communication
  'הודעות': '💬',
  'הודעה': '💬',
  'התראות': '🔔',
  'התראה': '🔔',
  'פגישות': '🤝',
  'פגישה': '🤝',
  'אירועים': '📅',
  'אירוע': '📅',
  
  // Documents & Files
  'קבצים': '📁',
  'קובץ': '📁',
  'מסמכים': '📄',
  'מסמך': '📄',
  
  // Organization
  'סניפים': '🏢',
  'סניף': '🏢',
  'מחלקות': '🏛️',
  'מחלקה': '🏛️',
  'ניהול': '⚙️',
  'נהול': '⚙️',
  'הגדרות': '🔧',
  'הגדרה': '🔧',
  
  // Support & Service
  'תמיכה': '🆘',
  'שירות': '🔧',
  'בקשות': '📝',
  'בקשה': '📝',
  'אישורים': '✅',
  'אישור': '✅'
};

// Module route mapping for dynamic routes
export const moduleRouteMapping: Record<string, { 
  parentRoute: string; 
  subModules?: Record<string, string>;
  hebrewName: string;
  tableName: string;
}> = {
  'employees': {
    parentRoute: '/modules/employees',
    hebrewName: 'ניהול עובדים',
    tableName: 'employees',
    subModules: {
      'employee-files': 'קבצי עובדים',
      'attendance': 'נוכחות',
      'employee-requests': 'בקשות עובדים',
      'employee-docs': 'מסמכים חתומים',
      'shifts': 'משמרות',
      'payroll': 'משכורות'
    }
  },
  'branches': {
    parentRoute: '/modules/branches',
    hebrewName: 'ניהול סניפים',
    tableName: 'branches',
    subModules: {
      'branch-roles': 'תפקידים בסניף',
      'branch-equipment': 'ציוד סניף'
    }
  },
  'customers': {
    parentRoute: '/modules/customers',
    hebrewName: 'ניהול לקוחות',
    tableName: 'customers'
  },
  'inventory': {
    parentRoute: '/modules/inventory',
    hebrewName: 'ניהול מלאי',
    tableName: 'inventory'
  },
  'projects': {
    parentRoute: '/modules/projects',
    hebrewName: 'ניהול פרויקטים',
    tableName: 'projects'
  }
};

export const generateTableName = (name: string, businessId: string, moduleId?: string): string => {
  // Convert Hebrew to English, then create table name
  const englishName = translateHebrewToEnglish(name);
  let baseName = englishName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Add business ID suffix for separation
  const businessSuffix = `_${businessId.toString().padStart(3, '0')}`;
  
  // If moduleId is provided, append a short version of it to ensure uniqueness
  if (moduleId) {
    const shortId = moduleId.substring(0, 8);
    return `${baseName}_${shortId}${businessSuffix}`;
  }
  
  return `${baseName}${businessSuffix}`;
};

export const generateRoute = (name: string, parentModule?: string): string => {
  // Convert Hebrew to English for URL-friendly route parameter only
  const englishName = translateHebrewToEnglish(name);
  const routePart = englishName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  if (parentModule) {
    return `/modules/${parentModule}/${routePart}`;
  }
  
  return `/modules/${routePart}`;
};

export const generateIcon = (name: string): string => {
  // Find the best matching icon based on Hebrew keywords
  const lowerName = name.toLowerCase();
  
  // Check for exact matches first
  for (const [hebrew, icon] of Object.entries(hebrewToIconMapping)) {
    if (lowerName.includes(hebrew)) {
      return icon;
    }
  }
  
  // Default icon if no match found
  return '📋';
};

const translateHebrewToEnglish = (hebrewText: string): string => {
  let result = hebrewText;
  
  // Replace Hebrew words with English equivalents
  for (const [hebrew, english] of Object.entries(hebrewToEnglishMapping)) {
    const regex = new RegExp(hebrew, 'g');
    result = result.replace(regex, english);
  }
  
  // If no Hebrew words were found, create a generic English name
  if (result === hebrewText) {
    // Remove Hebrew characters and replace with generic name
    result = result.replace(/[\u0590-\u05FF]/g, '').trim();
    if (!result) {
      result = 'custom_module';
    }
  }
  
  return result;
};

export const validateModuleName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'שם המודל הוא שדה חובה' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'שם המודל חייב להכיל לפחות 2 תווים' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'שם המודל לא יכול להכיל יותר מ-50 תווים' };
  }
  
  return { isValid: true };
};

// New function to get or create business ID for user
export const getBusinessIdForUser = async (userId: string): Promise<string> => {
  try {
    // Check if user is super admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error checking user role:', profileError);
      throw new Error('לא ניתן לבדוק הרשאות משתמש');
    }

    // Super admin gets business ID "000"
    if (profileData?.role === 'super_admin') {
      return '000';
    }

    // For regular users, get or create business ID
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .single();

    if (businessError && businessError.code !== 'PGRST116') {
      console.error('Error getting business:', businessError);
      throw new Error('לא ניתן לקבל מידע על העסק');
    }

    if (!businessData) {
      // Create new business and assign sequential ID
      const businessId = await createNewBusinessWithId(userId);
      return businessId;
    }

    // Get existing business ID from businesses table
    const { data: existingBusiness, error: getBusinessError } = await supabase
      .from('businesses')
      .select('business_id')
      .eq('id', businessData.id)
      .single();

    if (getBusinessError) {
      console.error('Error getting business ID:', getBusinessError);
      throw new Error('לא ניתן לקבל מזהה עסק');
    }

    return existingBusiness.business_id || '001';
  } catch (error) {
    console.error('Error in getBusinessIdForUser:', error);
    throw error;
  }
};

// Function to create new business with sequential ID
const createNewBusinessWithId = async (userId: string): Promise<string> => {
  try {
    // Get the highest business ID and increment
    const { data: maxBusinessData, error: maxError } = await supabase
      .from('businesses')
      .select('business_id')
      .order('business_id', { ascending: false })
      .limit(1);

    if (maxError) {
      console.error('Error getting max business ID:', maxError);
      throw new Error('לא ניתן לקבל מספר עסק חדש');
    }

    let nextBusinessId = '001';
    if (maxBusinessData && maxBusinessData.length > 0 && maxBusinessData[0].business_id) {
      const currentMax = parseInt(maxBusinessData[0].business_id);
      nextBusinessId = (currentMax + 1).toString().padStart(3, '0');
    }

    // Create the business record
    const { error: createError } = await supabase
      .from('businesses')
      .insert({
        owner_id: userId,
        business_id: nextBusinessId,
        name: `עסק ${nextBusinessId}`,
        is_active: true
      });

    if (createError) {
      console.error('Error creating business:', createError);
      throw new Error('לא ניתן ליצור עסק חדש');
    }

    return nextBusinessId;
  } catch (error) {
    console.error('Error in createNewBusinessWithId:', error);
    throw error;
  }
};

// Function to get table name with business ID
export const getTableNameForBusiness = (baseTableName: string, businessId: string): string => {
  return `${baseTableName}_${businessId.padStart(3, '0')}`;
};

// Function to parse route and get module info
export const parseModuleRoute = (route: string): { 
  parentModule?: string; 
  subModule?: string; 
  fullRoute: string;
} => {
  const routeParts = route.replace('/modules/', '').split('/');
  
  if (routeParts.length === 1) {
    return {
      parentModule: routeParts[0],
      fullRoute: route
    };
  } else if (routeParts.length === 2) {
    return {
      parentModule: routeParts[0],
      subModule: routeParts[1],
      fullRoute: route
    };
  }
  
  return { fullRoute: route };
};

// New function to clean up module data when deleting
export const cleanupModuleData = async (moduleId: string, tableName?: string) => {
  try {
    // Note: Custom table cleanup is handled at the database level via triggers
    // when the module is deleted, so we don't need to manually drop the table here
    
    // Delete module fields
    const { error: fieldsError } = await supabase
      .from('module_fields')
      .delete()
      .eq('module_id', moduleId);

    if (fieldsError) {
      console.error('Error deleting module fields:', fieldsError);
    }

    // Delete module data
    const { error: dataError } = await supabase
      .from('module_data')
      .delete()
      .eq('module_id', moduleId);

    if (dataError) {
      console.error('Error deleting module data:', dataError);
    }

    // Delete business module associations
    const { error: businessModulesError } = await supabase
      .from('business_modules')
      .delete()
      .eq('module_id', moduleId);

    if (businessModulesError) {
      console.error('Error deleting business module associations:', businessModulesError);
    }

    console.log('Module cleanup completed successfully');
    return true;
  } catch (error) {
    console.error('Error in module cleanup:', error);
    return false;
  }
};
