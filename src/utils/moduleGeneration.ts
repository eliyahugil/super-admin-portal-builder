
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
