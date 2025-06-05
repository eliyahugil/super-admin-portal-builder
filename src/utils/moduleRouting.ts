
import type { ModuleRouteInfo } from './moduleTypes';

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
