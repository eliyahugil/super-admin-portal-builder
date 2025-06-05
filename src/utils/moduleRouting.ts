
import type { ModuleRouteInfo } from './moduleTypes';

// Module route mappings with sub-modules
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
  },
  'integrations': {
    name: 'ניהול אינטגרציות',
    description: 'ניהול ואינטגרציה עם שירותים חיצוניים',
    icon: '🔗',
    subModules: {
      'business': { name: 'אינטגרציות עסק', description: 'ניהול אינטגרציות פרטיות לעסק' },
      'supported': { name: 'אינטגרציות זמינות', description: 'רשימת אינטגרציות זמינות' },
      'admin': { name: 'ניהול גלובלי', description: 'ניהול אינטגרציות גלובליות' },
    }
  },
  'inventory': {
    name: 'ניהול מלאי',
    description: 'מעקב מלאי ומוצרים',
    icon: '📦',
    subModules: {
      'products': { name: 'מוצרים', description: 'ניהול קטלוג מוצרים' },
      'stock-movements': { name: 'תנועות מלאי', description: 'מעקב תנועות במלאי' },
    }
  },
  'orders': {
    name: 'ניהול הזמנות',
    description: 'עיבוד והזמנות לקוחות',
    icon: '📋',
    subModules: {
      'delivery': { name: 'משלוחים', description: 'ניהול משלוחים' },
      'pickup': { name: 'איסוף עצמי', description: 'ניהול איסוף עצמי' },
    }
  },
  'finance': {
    name: 'ניהול כספים',
    description: 'חשבוניות ותשלומים',
    icon: '💰',
    subModules: {
      'invoices': { name: 'חשבוניות', description: 'ניהול חשבוניות' },
      'payments': { name: 'תשלומים', description: 'מעקב תשלומים' },
      'reports': { name: 'דוחות', description: 'דוחות כספיים' },
    }
  },
  'projects': {
    name: 'ניהול פרויקטים',
    description: 'מעקב פרויקטים ומשימות',
    icon: '🎯',
    subModules: {
      'tasks': { name: 'משימות', description: 'ניהול משימות' },
    }
  },
  'settings': {
    name: 'הגדרות',
    description: 'הגדרות עסק והרשאות',
    icon: '⚙️',
    subModules: {
      'profile': { name: 'פרטי עסק', description: 'עריכת פרטי העסק' },
      'users': { name: 'משתמשים', description: 'ניהול משתמשים פנימיים' },
      'permissions': { name: 'הרשאות', description: 'ניהול הרשאות משתמשים' },
      'integrations': { name: 'אינטגרציות', description: 'אינטגרציות אישיות לעסק' },
    }
  }
} as const;

// Parse module route information
export const parseModuleRoute = (route: string): ModuleRouteInfo => {
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

// Get available sub-modules for a module
export const getSubModules = (moduleRoute: string): Record<string, { name: string; description: string }> => {
  const moduleConfig = moduleRouteMapping[moduleRoute];
  return moduleConfig?.subModules || {};
};

// Validate if a sub-module exists for a module
export const isValidSubModule = (moduleRoute: string, subModule: string): boolean => {
  const subModules = getSubModules(moduleRoute);
  return subModule in subModules;
};
