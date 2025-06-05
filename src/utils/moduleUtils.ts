
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

export const generateTableName = (name: string, moduleId: string, customerNumber: number): string => {
  const englishName = translateHebrewToEnglish(name);
  let baseName = englishName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  const customerSuffix = `_${customerNumber.toString().padStart(3, '0')}`;
  const shortId = moduleId.substring(0, 8);
  return `${baseName}_${shortId}${customerSuffix}`;
};

export const generateRoute = (name: string, parentModule?: string): string => {
  const englishName = translateHebrewToEnglish(name);
  const routePart = englishName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  if (parentModule) {
    return `/modules/${parentModule}/${routePart}`;
  }
  
  return routePart;
};

export const generateIcon = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  for (const [hebrew, icon] of Object.entries(hebrewToIconMapping)) {
    if (lowerName.includes(hebrew)) {
      return icon;
    }
  }
  
  return '📋';
};

const translateHebrewToEnglish = (hebrewText: string): string => {
  let result = hebrewText;
  
  for (const [hebrew, english] of Object.entries(hebrewToEnglishMapping)) {
    const regex = new RegExp(hebrew, 'g');
    result = result.replace(regex, english);
  }
  
  if (result === hebrewText) {
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

export const getCurrentBusinessId = async (): Promise<string | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return null;
    }

    // Check if user is super admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error checking user role:', profileError);
      return null;
    }

    // Super admin has access to all businesses
    if (profileData?.role === 'super_admin') {
      return 'super_admin';
    }

    // Get business for regular user
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (businessError || !businessData) {
      console.error('Error getting business:', businessError);
      return null;
    }

    return businessData.id;
  } catch (error) {
    console.error('Error in getCurrentBusinessId:', error);
    return null;
  }
};

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

export const cleanupModuleData = async (moduleId: string, tableName?: string) => {
  try {
    const { error: fieldsError } = await supabase
      .from('module_fields')
      .delete()
      .eq('module_id', moduleId);

    if (fieldsError) {
      console.error('Error deleting module fields:', fieldsError);
    }

    const { error: dataError } = await supabase
      .from('module_data')
      .delete()
      .eq('module_id', moduleId);

    if (dataError) {
      console.error('Error deleting module data:', dataError);
    }

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
