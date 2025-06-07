
export const validateEmployeeData = (data: any, businessId: string) => {
  const errors: string[] = [];
  
  if (!data.first_name) {
    errors.push('שם פרטי חובה');
  }
  
  if (!data.last_name) {
    errors.push('שם משפחה חובה');
  }
  
  if (data.email && !data.email.includes('@')) {
    errors.push('כתובת מייל לא תקינה');
  }
  
  if (data.phone && typeof data.phone !== 'string') {
    errors.push('מספר טלפון לא תקין');
  }
  
  if (data.id_number && (typeof data.id_number !== 'string' || data.id_number.length < 9)) {
    errors.push('מספר זהות לא תקין');
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
    notes: data.notes?.toString().trim() || null
  };
};
