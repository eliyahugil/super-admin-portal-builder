
export interface BusinessFormData {
  name: string;
  admin_email: string;
  contact_phone: string;
  address: string;
  description: string;
  admin_full_name: string;
}

export interface ModuleOption {
  key: string;
  label: string;
  description: string;
}

export const availableModules: ModuleOption[] = [
  { key: 'shift_management', label: 'ניהול משמרות', description: 'ניהול משמרות עובדים ולוחות זמנים' },
  { key: 'employee_documents', label: 'מסמכי עובדים', description: 'ניהול מסמכים וקבצים של עובדים' },
  { key: 'employee_notes', label: 'הערות עובדים', description: 'ניהול הערות ותיעוד אישי' },
  { key: 'salary_management', label: 'ניהול שכר', description: 'מעקב היסטוריית שכר ושינויים' },
  { key: 'employee_contacts', label: 'יצירת קשר עובדים', description: 'מערכת תקשורת עם עובדים' },
  { key: 'branch_management', label: 'ניהול סניפים', description: 'ניהול סניפים ומיקומים' },
  { key: 'employee_attendance', label: 'נוכחות עובדים', description: 'מעקב נוכחות וזמני עבודה' },
];
