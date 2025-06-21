
export interface EmployeeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateEmployeeData = (employeeData: any): EmployeeValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!employeeData.first_name?.trim()) {
    errors.push('שם פרטי חובה');
  }

  if (!employeeData.last_name?.trim()) {
    errors.push('שם משפחה חובה');
  }

  // Email validation
  if (employeeData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeData.email)) {
      errors.push('כתובת אימייל לא תקינה');
    }
  }

  // Phone validation (basic Israeli phone number format)
  if (employeeData.phone) {
    const phoneRegex = /^0[5-7]\d-?\d{7}$|^0[2-4,8-9]\d{7,8}$/;
    if (!phoneRegex.test(employeeData.phone.replace(/\D/g, ''))) {
      warnings.push('פורמט מספר טלפון לא תקין');
    }
  }

  // ID number validation (Israeli ID format)
  if (employeeData.id_number) {
    const idRegex = /^\d{9}$/;
    if (!idRegex.test(employeeData.id_number)) {
      warnings.push('מספר תעודת זהות צריך להכיל 9 ספרות');
    }
  }

  // Employee type validation
  const validEmployeeTypes = ['permanent', 'temporary', 'contractor', 'youth'];
  if (employeeData.employee_type && !validEmployeeTypes.includes(employeeData.employee_type)) {
    warnings.push('סוג עובד לא תקין');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];
  
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  const hasValidType = allowedTypes.includes(file.type);
  
  return hasValidExtension || hasValidType;
};

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};
