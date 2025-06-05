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

export const generateTableName = (name: string, moduleId?: string, customerNumber?: number): string => {
  // Convert Hebrew to English, then create table name
  const englishName = translateHebrewToEnglish(name);
  let baseName = 'custom_' + englishName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Add customer number prefix for better organization
  if (customerNumber !== undefined) {
    baseName = `c${customerNumber}_${baseName}`;
  }
  
  // If moduleId is provided, append a short version of it to ensure uniqueness
  if (moduleId) {
    const shortId = moduleId.substring(0, 8);
    return `${baseName}_${shortId}`;
  }
  
  return baseName;
};

export const generateRoute = (name: string): string => {
  // Convert Hebrew to English for URL-friendly route parameter only
  const englishName = translateHebrewToEnglish(name);
  return englishName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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

// New function to get customer number for super admin or regular users
export const getCustomerNumberForUser = async (userId: string) => {
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

  // Super admin gets customer number 0
  if (profileData?.role === 'super_admin') {
    return 0;
  }

  // For regular users, get next customer number
  const { data: customerNumberData, error: customerNumberError } = await supabase
    .rpc('get_next_customer_number', { 
      business_id_param: '123e4567-e89b-12d3-a456-426614174000' // TODO: Replace with actual business_id from context
    });

  if (customerNumberError) {
    console.error('Error getting customer number:', customerNumberError);
    throw new Error('לא ניתן לקבל מספר לקוח');
  }

  return customerNumberData;
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
