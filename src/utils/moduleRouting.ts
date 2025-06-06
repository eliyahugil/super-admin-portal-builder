
// מפת ראוטרים מלאה למערכת
export interface RouteConfig {
  name: string;
  description: string;
  icon: string;
  requiresAuth?: boolean;
  requiresSuperAdmin?: boolean;
  requiresBusiness?: boolean;
  requiresIntegration?: string;
  subRoutes?: Record<string, RouteConfig>;
}

// מפת המודולים הזמינים במערכת
export const moduleRouteMapping: Record<string, RouteConfig> = {
  'employees': {
    name: 'ניהול עובדים',
    description: 'ניהול מידע עובדים',
    icon: '👥',
    requiresBusiness: true,
    subRoutes: {
      'employee-files': { name: 'קבצי עובדים', description: 'ניהול מסמכים וקבצים', icon: '📁' },
      'attendance': { name: 'ניהול נוכחות', description: 'מעקב נוכחות ושעות עבודה', icon: '⏰' },
      'employee-requests': { name: 'בקשות עובדים', description: 'ניהול בקשות ואישורים', icon: '📝' },
      'employee-docs': { name: 'מסמכים חתומים', description: 'מסמכים וטפסים חתומים דיגיטלית', icon: '📋' },
      'shifts': { name: 'ניהול משמרות', description: 'תכנון וניהול משמרות', icon: '🕐' },
      'import': { name: 'ייבוא עובדים', description: 'ייבוא מסיבי מאקסל', icon: '📈' },
      'profile': { name: 'פרופיל עובד', description: 'צפייה ועריכת פרטי עובד', icon: '👤' },
    }
  },
  'branches': {
    name: 'ניהול סניפים',
    description: 'ניהול סניפים ומיקומים',
    icon: '🏢',
    requiresBusiness: true,
    subRoutes: {
      'branch-roles': { name: 'תפקידי סניף', description: 'ניהול תפקידים בסניף', icon: '👔' },
      'create': { name: 'יצירת סניף', description: 'הוספת סניף חדש', icon: '➕' },
      'edit': { name: 'עריכת סניף', description: 'עריכת פרטי סניף', icon: '✏️' },
    }
  },
  'shifts': {
    name: 'ניהול משמרות מתקדם',
    description: 'ניהול טוקנים, הגשות ואישורי משמרות',
    icon: '⏰',
    requiresBusiness: true,
    subRoutes: {
      'requests': { name: 'בקשות משמרת', description: 'הגשת בקשות למשמרות', icon: '📝' },
      'approval': { name: 'אישור משמרות', description: 'אישור וניהול בקשות משמרות', icon: '✅' },
      'schedule': { name: 'לוח משמרות', description: 'תצוגת לוח שעות', icon: '📅' },
      'admin': { name: 'ניהול משמרות', description: 'כלי ניהול למנהלים', icon: '⚙️' },
      'tokens': { name: 'ניהול טוקנים', description: 'ניהול טוקני משמרות', icon: '🎫' },
    }
  },
  'integrations': {
    name: 'אינטגרציות עסק',
    description: 'הגדרות אינטגרציה פרטיות לעסק',
    icon: '🔌',
    requiresBusiness: true,
  },
  'settings': {
    name: 'הגדרות עסק',
    description: 'הגדרות כלליות של העסק',
    icon: '⚙️',
    requiresBusiness: true,
    subRoutes: {
      'profile': { name: 'פרטי עסק', description: 'עריכת פרטי העסק', icon: '🏪' },
      'users': { name: 'משתמשים', description: 'ניהול משתמשים פנימיים', icon: '👤' },
      'permissions': { name: 'הרשאות', description: 'ניהול הרשאות משתמשים', icon: '🔐' },
      'integrations': { name: 'אינטגרציות', description: 'ניהול אינטגרציות', icon: '🔗' },
    }
  },
  'inventory': {
    name: 'ניהול מלאי',
    description: 'ניהול מלאי ומוצרים',
    icon: '📦',
    requiresBusiness: true,
    subRoutes: {
      'products': { name: 'מוצרים', description: 'ניהול מוצרים', icon: '🛍️' },
      'stock-movements': { name: 'תנועות מלאי', description: 'מעקב תנועות מלאי', icon: '📊' },
    }
  },
  'orders': {
    name: 'ניהול הזמנות',
    description: 'ניהול הזמנות ומשלוחים',
    icon: '📋',
    requiresBusiness: true,
    subRoutes: {
      'delivery': { name: 'משלוחים', description: 'ניהול משלוחים', icon: '🚚' },
      'pickup': { name: 'איסוף עצמי', description: 'ניהול איסוף עצמי', icon: '🏪' },
    }
  },
  'finance': {
    name: 'ניהול כספים',
    description: 'ניהול כספים וחשבונאות',
    icon: '💰',
    requiresBusiness: true,
    subRoutes: {
      'invoices': { name: 'חשבוניות', description: 'ניהול חשבוניות', icon: '📄' },
      'payments': { name: 'תשלומים', description: 'ניהול תשלומים', icon: '💳' },
      'reports': { name: 'דוחות', description: 'דוחות כספיים', icon: '📊' },
    }
  },
  'projects': {
    name: 'ניהול פרויקטים',
    description: 'ניהול פרויקטים ומשימות',
    icon: '📁',
    requiresBusiness: true,
    subRoutes: {
      'tasks': { name: 'משימות', description: 'ניהול משימות', icon: '✅' },
    }
  },
  'admin': {
    name: 'לוח בקרה מנהל',
    description: 'עמוד בית של הסופר-אדמין',
    icon: '🏠',
    requiresSuperAdmin: true,
    subRoutes: {
      'businesses': { name: 'ניהול עסקים', description: 'ניהול כל העסקים במערכת', icon: '🏢' },
      'modules': { name: 'ניהול מודולים', description: 'ניהול מודולים ותתי מודולים', icon: '🧩' },
      'integrations': { name: 'אינטגרציות כלליות', description: 'ממשק אינטגרציות כלליות', icon: '🔗' },
      'system-preview': { name: 'תצוגת מערכת', description: 'תצוגה ובדיקת מודולים', icon: '👁️' },
    }
  },
  'crm': {
    name: 'CRM',
    description: 'מערכת ניהול לקוחות',
    icon: '🤝',
    requiresAuth: true,
    subRoutes: {
      'leads': { name: 'לידים', description: 'ניהול לידים', icon: '🎯' },
      'franchisees': { name: 'זכיינים', description: 'ניהול זכיינים', icon: '🏪' },
      'wholesale': { name: 'לקוחות סיטונאיים', description: 'לקוחות סיטונאיים', icon: '📦' },
      'events': { name: 'לקוחות אירועים', description: 'לקוחות אירועים', icon: '🎉' },
      'clients': { name: 'לקוחות קצה', description: 'לקוחות קצה', icon: '👤' },
    }
  }
};

// פונקציה לפרסור נתיב מודול
export const parseModuleRoute = (route: string) => {
  const parts = route.split('/').filter(Boolean);
  if (parts[0] === 'modules') {
    return {
      moduleRoute: parts[1],
      subModule: parts[2],
      itemId: parts[3]
    };
  }
  return {
    moduleRoute: parts[0],
    subModule: parts[1],
    itemId: parts[2]
  };
};

// פונקציה לבדיקת תת-מודול תקין
export const isValidSubModule = (moduleRoute: string, subModule: string): boolean => {
  const moduleConfig = moduleRouteMapping[moduleRoute];
  if (!moduleConfig || !moduleConfig.subRoutes) {
    return false;
  }
  return subModule in moduleConfig.subRoutes;
};

// פונקציות עזר לבדיקת הרשאות
export const checkRoutePermissions = (route: string, userRole: string, businessId?: string): boolean => {
  // בדיקה אם המשתמש הוא סופר-אדמין
  if (userRole === 'super_admin') {
    return true;
  }

  // בדיקה עבור ראוטרים של עסקים
  if (route.startsWith('admin/') && userRole !== 'super_admin') {
    return false;
  }

  // בדיקות נוספות לפי הרשאות...
  return true;
};

// קבלת נתיב מלא
export const getFullRoute = (businessId: string | null, route: string): string => {
  if (route.startsWith('admin/') || route.startsWith('crm/')) {
    return `/${route}`;
  }
  
  if (businessId && !route.startsWith('admin/')) {
    return `/${businessId}/${route}`;
  }
  
  return `/${route}`;
};

// יצירת ראוטים בפורמט מודולים
export const getModuleRoutes = (businessId?: string | number) => {
  const prefix = businessId && businessId !== 'super_admin' ? `/business/${businessId}` : '';
  
  return {
    employees: {
      base: `${prefix}/modules/employees`,
      files: `${prefix}/modules/employees/employee-files`,
      profile: `${prefix}/modules/employees/profile`,
      attendance: `${prefix}/modules/employees/attendance`,
      requests: `${prefix}/modules/employees/employee-requests`,
      docs: `${prefix}/modules/employees/employee-docs`,
      shifts: `${prefix}/modules/employees/shifts`,
      import: `${prefix}/modules/employees/import`,
    },
    branches: {
      base: `${prefix}/modules/branches`,
      roles: `${prefix}/modules/branches/branch-roles`,
      create: `${prefix}/modules/branches/create`,
      edit: (id: string) => `${prefix}/modules/branches/edit/${id}`,
    },
    shifts: {
      base: `${prefix}/modules/shifts`,
      requests: `${prefix}/modules/shifts/requests`,
      approval: `${prefix}/modules/shifts/approval`,
      schedule: `${prefix}/modules/shifts/schedule`,
      admin: `${prefix}/modules/shifts/admin`,
      tokens: `${prefix}/modules/shifts/tokens`,
    },
    integrations: {
      base: `${prefix}/modules/integrations`,
      googleMaps: `${prefix}/modules/integrations/google-maps`,
      whatsapp: `${prefix}/modules/integrations/whatsapp`,
      facebook: `${prefix}/modules/integrations/facebook`,
      invoices: `${prefix}/modules/integrations/invoices`,
      crm: `${prefix}/modules/integrations/crm`,
      payments: `${prefix}/modules/integrations/payments`,
      custom: `${prefix}/modules/integrations/custom`,
    },
    settings: {
      base: `${prefix}/modules/settings`,
      profile: `${prefix}/modules/settings/profile`,
      users: `${prefix}/modules/settings/users`,
      permissions: `${prefix}/modules/settings/permissions`,
    }
  };
};

// מיזוג כל הראוטרים - הוסרה כיוון שהיא כפולה
export const allRoutes = moduleRouteMapping;
