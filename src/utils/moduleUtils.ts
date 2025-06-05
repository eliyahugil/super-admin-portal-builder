
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

export const generateTableName = (name: string): string => {
  // Convert Hebrew to English, then create table name
  const englishName = translateHebrewToEnglish(name);
  return 'custom_' + englishName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
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
