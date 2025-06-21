
export const TYPE_CATEGORIES = {
  employee_type: {
    label: 'סוג עובד',
    placeholder: 'בחר סוג עובד',
    tableName: 'employee_types',
  },
  branch: {
    label: 'סניף',
    placeholder: 'בחר סניף',
    tableName: 'branches',
  },
  customer_type: {
    label: 'סוג לקוח', 
    placeholder: 'בחר סוג לקוח',
    tableName: 'customer_types',
  },
} as const;

export type TypeCategoryKey = keyof typeof TYPE_CATEGORIES;

export const EMPLOYEE_TYPE_OPTIONS = [
  { value: 'permanent', label: 'קבוע' },
  { value: 'temporary', label: 'זמני' },
  { value: 'youth', label: 'נוער' },
  { value: 'contractor', label: 'קבלן' },
];
