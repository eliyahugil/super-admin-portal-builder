
export const SYSTEM_FIELDS = [
  { value: 'first_name', label: 'שם פרטי', required: true },
  { value: 'last_name', label: 'שם משפחה', required: true },
  { value: 'email', label: 'אימייל', required: false },
  { value: 'phone', label: 'טלפון', required: false },
  { value: 'id_number', label: 'תעודת זהות', required: false },
  { value: 'employee_id', label: 'מספר עובד', required: false },
  { value: 'address', label: 'כתובת', required: false },
  { value: 'hire_date', label: 'תאריך התחלה', required: false },
  { value: 'employee_type', label: 'סוג עובד', required: false },
  { value: 'weekly_hours_required', label: 'שעות שבועיות', required: false },
  { value: 'main_branch_id', label: 'סניף ראשי', required: false },
  { value: 'notes', label: 'הערות', required: false },
] as const;

export const EMPLOYEE_TYPE_OPTIONS = [
  { value: 'permanent', label: 'קבוע' },
  { value: 'temporary', label: 'זמני' },
  { value: 'youth', label: 'נוער' },
  { value: 'contractor', label: 'קבלן' },
];
