// מידע גירסה של האפליקציה
export const APP_VERSION = {
  version: '1.0.0',
  name: 'AllForYou Business Management',
  releaseDate: '2025-07-17',
  codeName: 'השקה ראשונה',
  features: [
    'ניהול עובדים מתקדם',
    'מערכת משמרות דיגיטלית', 
    'ניהול מסמכים וחתימות',
    'אינטגרציה עם WhatsApp',
    'מערכת הרשאות מלאה'
  ],
  buildNumber: Date.now(),
  environment: import.meta.env.MODE || 'production'
};

// פונקציה לקבלת מחרוזת גירסה מלאה
export const getFullVersionString = () => {
  return `${APP_VERSION.name} v${APP_VERSION.version} (${APP_VERSION.codeName})`;
};

// פונקציה לקבלת מידע גירסה מפורט
export const getVersionInfo = () => {
  return {
    ...APP_VERSION,
    fullVersionString: getFullVersionString(),
    isProduction: APP_VERSION.environment === 'production',
    releaseAge: Math.floor((Date.now() - new Date(APP_VERSION.releaseDate).getTime()) / (1000 * 60 * 60 * 24))
  };
};