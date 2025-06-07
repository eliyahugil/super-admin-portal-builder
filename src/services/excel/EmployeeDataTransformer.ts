
export interface PreviewEmployee {
  rowIndex: number;
  data: {
    business_id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    id_number?: string;
    employee_id?: string;
    address?: string;
    hire_date?: string;
    employee_type: 'permanent' | 'temporary' | 'contractor' | 'intern';
    weekly_hours_required?: number;
    main_branch_id?: string;
    notes?: string;
  };
  customFields: Record<string, any>;
  isValid: boolean;
  isDuplicate: boolean;
  hasWarnings: boolean;
  errors: string[];
  warnings: string[];
}

export class EmployeeDataTransformer {
  static generatePreview(
    rawData: any[],
    fieldMappings: any[],
    businessId: string,
    branches: any[],
    existingEmployees: any[],
    employeeTypes: any[]
  ): PreviewEmployee[] {
    return rawData.map((row, index) => {
      const employeeData: any = { business_id: businessId };
      const customFields: Record<string, any> = {};
      const errors: string[] = [];
      const warnings: string[] = [];

      // Transform data based on field mappings
      fieldMappings.forEach(mapping => {
        if (mapping.systemField && mapping.mappedColumns.length > 0) {
          const combinedValue = mapping.mappedColumns
            .map((col: string) => row[col] || '')
            .filter((val: string) => val !== '')
            .join(' ')
            .trim();

          if (mapping.isCustomField) {
            if (combinedValue) {
              customFields[mapping.systemField] = combinedValue;
            }
          } else {
            employeeData[mapping.systemField] = combinedValue;
          }
        }
      });

      // Basic validation
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
          errors.push('כתובת מייל לא תקינה');
        }
      }

      // Check for duplicates (עם אזהרות בלבד)
      let isDuplicate = false;
      const duplicateFields = ['email', 'phone', 'id_number', 'employee_id'];
      
      duplicateFields.forEach(field => {
        if (employeeData[field]) {
          const duplicate = existingEmployees.find(emp => 
            emp[field] && emp[field].toString().trim() === employeeData[field].toString().trim()
          );
          if (duplicate) {
            isDuplicate = true;
            warnings.push(`${field === 'email' ? 'אימייל' : field === 'phone' ? 'טלפון' : field === 'id_number' ? 'ת.ז' : 'מספר עובד'} כבר קיים במערכת`);
          }
        }
      });

      // Branch validation
      if (employeeData.main_branch_id) {
        const branch = branches.find(b => b.id === employeeData.main_branch_id || b.name === employeeData.main_branch_id);
        if (branch) {
          employeeData.main_branch_id = branch.id;
        } else {
          warnings.push('סניף לא נמצא במערכת');
          employeeData.main_branch_id = null;
        }
      }

      // Employee type validation
      if (employeeData.employee_type && !employeeTypes.includes(employeeData.employee_type)) {
        warnings.push('סוג עובד לא תקין, יוגדר כקבוע');
        employeeData.employee_type = 'permanent';
      }

      const isValid = errors.length === 0;
      const hasWarnings = warnings.length > 0;

      return {
        rowIndex: index + 1,
        data: employeeData,
        customFields,
        isValid,
        isDuplicate,
        hasWarnings,
        errors,
        warnings,
      };
    });
  }
}
