
import type { ImportResult } from '@/services/ExcelImportService';

export const systemFields = [
  { value: 'first_name', label: 'שם פרטי' },
  { value: 'last_name', label: 'שם משפחה' },
  { value: 'email', label: 'אימייל' },
  { value: 'phone', label: 'טלפון' },
  { value: 'id_number', label: 'תעודת זהות' },
  { value: 'employee_id', label: 'מספר עובד' },
  { value: 'address', label: 'כתובת' },
  { value: 'hire_date', label: 'תאריך התחלה' },
  { value: 'employee_type', label: 'סוג עובד' },
  { value: 'weekly_hours_required', label: 'שעות שבועיות נדרשות' },
  { value: 'main_branch_id', label: 'סניף ראשי' },
  { value: 'notes', label: 'הערות' },
];

export const employeeTypes = [
  { value: 'permanent', label: 'קבוע' },
  { value: 'temporary', label: 'זמני' },
  { value: 'youth', label: 'נוער' },
  { value: 'contractor', label: 'קבלן' },
];

export const initialImportResult: ImportResult = {
  success: false,
  importedCount: 0,
  errorCount: 0,
  message: '',
  errors: [],
  importedEmployees: []
};
