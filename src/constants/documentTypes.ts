export interface DocumentType {
  code: string; // קוד באנגלית למערכת
  prefix: string; // קידומת למספור
  nameHe: string; // שם בעברית
  nameEn: string; // שם באנגלית
  description: string; // תיאור השימוש
  category: 'sales' | 'purchase' | 'credit' | 'delivery' | 'other'; // קטגוריה
  requiresVAT: boolean; // האם חייב במע"מ
  isActive: boolean; // האם פעיל במערכת
}

export const DOCUMENT_TYPES: Record<string, DocumentType> = {
  INV: {
    code: 'INV',
    prefix: 'INV-',
    nameHe: 'חשבונית מס',
    nameEn: 'Invoice',
    description: 'מסמך רשמי המחייב את הלקוח בתשלום ומאפשר ניכוי מע״מ',
    category: 'sales',
    requiresVAT: true,
    isActive: true,
  },
  REC: {
    code: 'REC',
    prefix: 'REC-',
    nameHe: 'קבלה',
    nameEn: 'Receipt',
    description: 'מסמך המאשר קבלת תשלום בפועל',
    category: 'sales',
    requiresVAT: false,
    isActive: true,
  },
  INVR: {
    code: 'INVR',
    prefix: 'INVR-',
    nameHe: 'חשבונית מס/קבלה',
    nameEn: 'Invoice & Receipt',
    description: 'משולב: גם חשבונית מס וגם קבלה - לעסקאות עם תשלום מיידי',
    category: 'sales',
    requiresVAT: true,
    isActive: true,
  },
  CRD: {
    code: 'CRD',
    prefix: 'CRD-',
    nameHe: 'חשבונית זיכוי',
    nameEn: 'Credit Invoice',
    description: 'נועדה לתקן או לזכות לקוח על עסקה קודמת',
    category: 'credit',
    requiresVAT: true,
    isActive: true,
  },
  PRO: {
    code: 'PRO',
    prefix: 'PRO-',
    nameHe: 'חשבונית עסקה',
    nameEn: 'Proforma Invoice',
    description: 'הצעת מחיר/חשבונית שאינה מחייבת לצורכי מע״מ',
    category: 'other',
    requiresVAT: false,
    isActive: true,
  },
  DLV: {
    code: 'DLV',
    prefix: 'DLV-',
    nameHe: 'תעודת משלוח',
    nameEn: 'Delivery Note',
    description: 'מלווה את הסחורה בעת אספקה',
    category: 'delivery',
    requiresVAT: false,
    isActive: true,
  },
  RTN: {
    code: 'RTN',
    prefix: 'RTN-',
    nameHe: 'תעודת החזרה',
    nameEn: 'Return Note',
    description: 'מתעדת החזרת סחורה מספק ללקוח או להפך',
    category: 'delivery',
    requiresVAT: false,
    isActive: true,
  },
  CRN: {
    code: 'CRN',
    prefix: 'CRN-',
    nameHe: 'תעודת זיכוי',
    nameEn: 'Credit Note',
    description: 'מסמך המנפיק זיכוי לא כספי',
    category: 'credit',
    requiresVAT: false,
    isActive: true,
  },
  DBN: {
    code: 'DBN',
    prefix: 'DBN-',
    nameHe: 'תעודת חיוב',
    nameEn: 'Debit Note',
    description: 'משמשת להוספת חיוב נוסף ללקוח',
    category: 'sales',
    requiresVAT: false,
    isActive: true,
  },
  QUO: {
    code: 'QUO',
    prefix: 'QUO-',
    nameHe: 'הצעת מחיר',
    nameEn: 'Quotation',
    description: 'מסמך הצעה מסחרי המפרט מחירים ותנאים',
    category: 'other',
    requiresVAT: false,
    isActive: true,
  },
  ORD: {
    code: 'ORD',
    prefix: 'ORD-',
    nameHe: 'הזמנה',
    nameEn: 'Order',
    description: 'מסמך הזמנה לפני ההפקה החשבונית',
    category: 'other',
    requiresVAT: false,
    isActive: true,
  },
  SRV: {
    code: 'SRV',
    prefix: 'SRV-',
    nameHe: 'תעודת אחריות/שירות',
    nameEn: 'Warranty/Service Note',
    description: 'מצורף לעיתים עם מוצר או תיקון',
    category: 'other',
    requiresVAT: false,
    isActive: false,
  },
  SUM: {
    code: 'SUM',
    prefix: 'SUM-',
    nameHe: 'חשבונית ריכוז',
    nameEn: 'Summary Invoice',
    description: 'מרכזת מספר עסקאות לחשבונית אחת',
    category: 'sales',
    requiresVAT: true,
    isActive: true,
  },
  PMT: {
    code: 'PMT',
    prefix: 'PMT-',
    nameHe: 'דו״ח הפקדה/תשלום',
    nameEn: 'Payment Report',
    description: 'דו״ח המסכם הפקדות/תשלומים',
    category: 'other',
    requiresVAT: false,
    isActive: false,
  },
  CAN: {
    code: 'CAN',
    prefix: 'CAN-',
    nameHe: 'תעודת ביטול מסמך',
    nameEn: 'Cancellation Document',
    description: 'משמשת לציון ביטול רשמי של מסמך',
    category: 'other',
    requiresVAT: false,
    isActive: false,
  },
  PINV: {
    code: 'PINV',
    prefix: 'PINV-',
    nameHe: 'חשבונית רכש (ספק)',
    nameEn: 'Purchase Invoice',
    description: 'נועדה לרישום חשבוניות שהתקבלו מספקים',
    category: 'purchase',
    requiresVAT: true,
    isActive: true,
  },
  IMP: {
    code: 'IMP',
    prefix: 'IMP-',
    nameHe: 'חשבונית יבוא',
    nameEn: 'Import Invoice',
    description: 'משמשת לעסקאות יבוא מחו״ל',
    category: 'purchase',
    requiresVAT: true,
    isActive: false,
  },
  EXP: {
    code: 'EXP',
    prefix: 'EXP-',
    nameHe: 'חשבונית יצוא',
    nameEn: 'Export Invoice',
    description: 'חשבונית לעסקאות מול לקוחות בחו״ל',
    category: 'sales',
    requiresVAT: false,
    isActive: false,
  },
};

// פונקציות עזר
export const getDocumentTypeByCode = (code: string): DocumentType | undefined => {
  return DOCUMENT_TYPES[code];
};

export const getActiveDocumentTypes = (): DocumentType[] => {
  return Object.values(DOCUMENT_TYPES).filter(dt => dt.isActive);
};

export const getDocumentTypesByCategory = (category: DocumentType['category']): DocumentType[] => {
  return Object.values(DOCUMENT_TYPES).filter(dt => dt.category === category && dt.isActive);
};

export const getCategoryLabel = (category: DocumentType['category']): string => {
  const labels: Record<DocumentType['category'], string> = {
    sales: 'מסמכי מכירה',
    purchase: 'מסמכי רכש',
    credit: 'מסמכי זיכוי',
    delivery: 'מסמכי משלוח',
    other: 'מסמכים אחרים',
  };
  return labels[category];
};

export const getCategoryColor = (category: DocumentType['category']): string => {
  const colors: Record<DocumentType['category'], string> = {
    sales: 'bg-green-100 text-green-800',
    purchase: 'bg-blue-100 text-blue-800',
    credit: 'bg-orange-100 text-orange-800',
    delivery: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[category];
};
