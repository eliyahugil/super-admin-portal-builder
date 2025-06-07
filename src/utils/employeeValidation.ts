
export const validateEmployeeData = (data: any, businessId: string) => {
  const errors: string[] = [];
  
  // Required field validation
  if (!data.first_name || !data.first_name.toString().trim()) {
    errors.push('שם פרטי חובה');
  }
  
  if (!data.last_name || !data.last_name.toString().trim()) {
    errors.push('שם משפחה חובה');
  }
  
  // Email validation
  if (data.email) {
    const email = data.email.toString().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('כתובת מייל לא תקינה');
    }
  }
  
  // Phone validation
  if (data.phone) {
    const phone = data.phone.toString().trim();
    const phoneRegex = /^[\d\-\+\(\)\s]{7,20}$/;
    if (!phoneRegex.test(phone)) {
      errors.push('מספר טלפון לא תקין');
    }
  }
  
  // ID number validation
  if (data.id_number) {
    const idNumber = data.id_number.toString().trim();
    if (idNumber.length < 7 || idNumber.length > 9 || !/^\d+$/.test(idNumber)) {
      errors.push('מספר זהות לא תקין (צריך להיות 7-9 ספרות)');
    }
  }
  
  // Weekly hours validation
  if (data.weekly_hours_required !== null && data.weekly_hours_required !== undefined) {
    const hours = Number(data.weekly_hours_required);
    if (isNaN(hours) || hours < 0 || hours > 168) {
      errors.push('שעות שבועיות חייבות להיות בין 0 ל-168');
    }
  }
  
  // Date validation
  if (data.hire_date) {
    const hireDate = new Date(data.hire_date);
    if (isNaN(hireDate.getTime())) {
      errors.push('תאריך תחילת עבודה לא תקין');
    }
  }
  
  return { 
    isValid: errors.length === 0, 
    errors 
  };
};

export const validateBusinessId = (businessId: string | null): boolean => {
  return Boolean(businessId && businessId.trim().length > 0);
};

export const sanitizeEmployeeData = (data: any) => {
  return {
    ...data,
    first_name: data.first_name?.toString().trim() || '',
    last_name: data.last_name?.toString().trim() || '',
    email: data.email?.toString().trim() || null,
    phone: data.phone?.toString().trim() || null,
    id_number: data.id_number?.toString().trim() || null,
    employee_id: data.employee_id?.toString().trim() || null,
    address: data.address?.toString().trim() || null,
    notes: data.notes?.toString().trim() || null,
    weekly_hours_required: data.weekly_hours_required ? Number(data.weekly_hours_required) : null,
    hire_date: data.hire_date || null,
    employee_type: data.employee_type || 'permanent'
  };
};

export const validateFileSize = (file: File, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];
  return allowedTypes.includes(file.type);
};
