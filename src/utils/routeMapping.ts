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

// ראוטרים לסופר-אדמין
export const superAdminRoutes: Record<string, RouteConfig> = {
  'admin': {
    name: 'לוח בקרה מנהל',
    description: 'עמוד בית של הסופר-אדמין',
    icon: '🏠',
    requiresSuperAdmin: true,
  },
  'admin/businesses': {
    name: 'ניהול עסקים',
    description: 'ניהול כל העסקים במערכת',
    icon: '🏢',
    requiresSuperAdmin: true,
  },
  'admin/modules': {
    name: 'ניהול מודולים',
    description: 'ניהול מודולים ותתי מודולים',
    icon: '🧩',
    requiresSuperAdmin: true,
  },
  'admin/integrations': {
    name: 'אינטגרציות כלליות',
    description: 'ממשק אינטגרציות כלליות',
    icon: '🔗',
    requiresSuperAdmin: true,
    subRoutes: {
      'google-maps': { name: 'Google Maps', description: 'ניהול מפות וניווט', icon: '🗺️' },
      'whatsapp': { name: 'WhatsApp', description: 'הודעות WhatsApp', icon: '💬' },
      'facebook': { name: 'Facebook', description: 'Facebook Leads API', icon: '📘' },
      'invoices': { name: 'חשבוניות', description: 'מערכות חשבוניות', icon: '📄' },
      'payments': { name: 'תשלומים', description: 'מערכות תשלום', icon: '💳' },
      'signatures': { name: 'חתימות דיגיטליות', description: 'מסמכים חתומים', icon: '✍️' },
    }
  },
  'admin/system-preview': {
    name: 'תצוגת מערכת',
    description: 'תצוגה ובדיקת מודולים',
    icon: '👁️',
    requiresSuperAdmin: true,
  }
};

// ראוטרים לעסקים
export const businessRoutes: Record<string, RouteConfig> = {
  'dashboard': {
    name: 'דשבורד',
    description: 'דשבורד ראשי של העסק',
    icon: '📊',
    requiresBusiness: true,
  },
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
    name: 'ניהול משמרות',
    description: 'בקשות ואישור משמרות',
    icon: '⏰',
    requiresBusiness: true,
    subRoutes: {
      'requests': { name: 'בקשות משמרת', description: 'הגשת בקשות למשמרות', icon: '📝' },
      'approval': { name: 'אישור משמרות', description: 'אישור וניהול בקשות משמרות', icon: '✅' },
      'schedule': { name: 'לוח משמרות', description: 'תצוגת לוח שעות', icon: '📅' },
      'admin': { name: 'ניהול משמרות', description: 'כלי ניהול למנהלים', icon: '⚙️' },
    }
  },
  'integrations': {
    name: 'אינטגרציות עסק',
    description: 'הגדרות אינטגרציה פרטיות לעסק',
    icon: '🔌',
    requiresBusiness: true,
    subRoutes: {
      'google-maps': { name: 'Google Maps', description: 'הגדרות מפות', icon: '🗺️' },
      'whatsapp': { name: 'WhatsApp', description: 'הגדרות WhatsApp', icon: '💬' },
      'facebook': { name: 'Facebook', description: 'הגדרות Facebook', icon: '📘' },
      'invoices': { name: 'חשבוניות', description: 'הגדרות חשבוניות', icon: '📄' },
      'crm': { name: 'CRM', description: 'הגדרות CRM', icon: '👥' },
      'payments': { name: 'תשלומים', description: 'הגדרות תשלומים', icon: '💳' },
      'custom': { name: 'מותאם אישית', description: 'אינטגרציות מותאמות', icon: '⚙️' },
    }
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
    }
  }
};

// ראוטרים עבור CRM
export const crmRoutes: Record<string, RouteConfig> = {
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
      submission: `${prefix}/modules/shifts/submission`,
      requests: `${prefix}/modules/shifts/requests`,
      approval: `${prefix}/modules/shifts/approval`,
      schedule: `${prefix}/modules/shifts/schedule`,
      admin: `${prefix}/modules/shifts/admin`,
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

// מיזוג כל הראוטרים
export const allRoutes = {
  ...superAdminRoutes,
  ...businessRoutes,
  ...crmRoutes
};
