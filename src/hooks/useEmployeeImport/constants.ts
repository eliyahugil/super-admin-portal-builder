
export const employeeTypes = [
  { value: 'permanent', label: 'קבוע' },
  { value: 'temporary', label: 'זמני' },
  { value: 'youth', label: 'נוער' }, // שינוי מ-'intern' ל-'youth'
  { value: 'contractor', label: 'קבלן' }
];

export const systemFields = [
  { value: 'first_name', label: 'שם פרטי' },
  { value: 'last_name', label: 'שם משפחה' },
  { value: 'full_name', label: 'שם מלא' },
  { value: 'email', label: 'אימייל' },
  { value: 'phone', label: 'טלפון' },
  { value: 'id_number', label: 'מספר זהות' },
  { value: 'employee_id', label: 'מספר עובד' },
  { value: 'address', label: 'כתובת' },
  { value: 'hire_date', label: 'תאריך תחילת עבודה' },
  { value: 'employee_type', label: 'סוג עובד' },
  { value: 'weekly_hours_required', label: 'שעות שבועיות נדרשות' },
  { value: 'notes', label: 'הערות' },
  { value: 'branch_name', label: 'סניף' },
  { value: 'role', label: 'תפקיד' }
];

export const initialImportResult = {
  success: false,
  importedCount: 0,
  errorCount: 0,
  message: ''
};
