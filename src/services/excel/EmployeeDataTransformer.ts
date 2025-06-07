
import type { Employee } from '@/types/supabase';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';
import type { ExcelRow } from './ExcelParserService';

export interface PreviewEmployee {
  rowIndex: number;
  data: Partial<Employee> & { business_id: string };
  customFields: Record<string, any>;
  isValid: boolean;
  errors: string[];
  isDuplicate?: boolean;
}

export class EmployeeDataTransformer {
  static generatePreview(
    rawData: ExcelRow[],
    mappings: FieldMapping[],
    businessId: string,
    branches: any[],
    existingEmployees: any[],
    employeeTypes: Array<{ value: string; label: string }>
  ): PreviewEmployee[] {
    return rawData.map((row, index) => {
      const employeeData: Partial<Employee> & { business_id: string } = {
        business_id: businessId
      };
      const customFields: Record<string, any> = {};
      const errors: string[] = [];

      mappings.forEach(mapping => {
        if (mapping.systemField && mapping.mappedColumns.length > 0) {
          const combinedValue = mapping.mappedColumns
            .map(col => row[col] || '')
            .filter(val => val !== '')
            .join(' ')
            .trim();

          if (mapping.isCustomField) {
            customFields[mapping.customFieldName || mapping.systemField] = combinedValue;
          } else {
            let value = combinedValue;
            
            // Handle special field types
            if (mapping.systemField === 'hire_date' && value) {
              const date = new Date(value);
              if (isNaN(date.getTime())) {
                errors.push(`תאריך לא תקין: ${value}`);
              } else {
                value = date.toISOString().split('T')[0];
              }
            }
            
            if (mapping.systemField === 'employee_type' && value) {
              const validType = employeeTypes.find(type => 
                type.label === value || type.value === value
              );
              if (validType) {
                value = validType.value;
              } else {
                value = 'permanent';
              }
            }

            if (mapping.systemField === 'branch_name' && value) {
              const branch = branches.find(b => b.name === value);
              if (branch) {
                employeeData.main_branch_id = branch.id;
              } else {
                errors.push(`סניף לא נמצא: ${value}`);
              }
            }

            if (mapping.systemField === 'full_name' && value) {
              const nameParts = value.toString().split(' ');
              if (!employeeData.first_name) {
                employeeData.first_name = nameParts[0] || '';
              }
              if (!employeeData.last_name && nameParts.length > 1) {
                employeeData.last_name = nameParts.slice(1).join(' ');
              }
            }

            if (mapping.systemField === 'weekly_hours_required' && value) {
              const numValue = Number(value);
              if (!isNaN(numValue)) {
                employeeData.weekly_hours_required = numValue;
              }
            }

            if (mapping.systemField !== 'branch_name' && mapping.systemField !== 'full_name') {
              (employeeData as any)[mapping.systemField] = value;
            }
          }
        }
      });

      // Ensure required fields are present
      if (!employeeData.first_name) {
        errors.push('שם פרטי חובה');
      }
      if (!employeeData.last_name) {
        errors.push('שם משפחה חובה');
      }

      // Set default employee type if not provided
      if (!employeeData.employee_type) {
        employeeData.employee_type = 'permanent';
      }

      // Check for duplicates
      const isDuplicate = existingEmployees.some(emp => 
        (emp.email && employeeData.email && emp.email === employeeData.email) ||
        (emp.phone && employeeData.phone && emp.phone === employeeData.phone) ||
        (emp.id_number && employeeData.id_number && emp.id_number === employeeData.id_number)
      );

      return {
        rowIndex: index + 1,
        data: employeeData,
        customFields,
        isValid: errors.length === 0,
        errors,
        isDuplicate
      };
    });
  }
}
