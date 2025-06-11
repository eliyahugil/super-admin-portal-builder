
import type { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';
import type { PreviewEmployee } from '@/hooks/useEmployeeImport/types';

export class ExcelFileManager {
  static generatePreview(
    rawData: Record<string, any>[],
    mappings: FieldMapping[],
    businessId: string,
    branches: any[],
    existingEmployees: any[],
    employeeTypes: Array<{ value: string; label: string }>
  ): PreviewEmployee[] {
    console.log('🔄 ExcelFileManager - Generating preview:', {
      dataCount: rawData.length,
      mappingsCount: mappings.length,
      businessId
    });

    return rawData.map((row, index) => {
      const employee: Partial<PreviewEmployee> = {
        business_id: businessId,
        is_active: true,
        isValid: true,
        validationErrors: [],
        isDuplicate: false
      };

      // Apply field mappings
      mappings.forEach(mapping => {
        if (mapping.systemField && mapping.mappedColumns.length > 0) {
          // Get the first non-empty value from mapped columns
          const value = mapping.mappedColumns
            .map(col => row[col])
            .find(val => val && String(val).trim() !== '');

          if (value) {
            const trimmedValue = String(value).trim();
            
            switch (mapping.systemField) {
              case 'first_name':
                employee.first_name = trimmedValue;
                break;
              case 'last_name':
                employee.last_name = trimmedValue;
                break;
              case 'email':
                employee.email = trimmedValue;
                break;
              case 'phone':
                employee.phone = trimmedValue;
                break;
              case 'id_number':
                employee.id_number = trimmedValue;
                break;
              case 'employee_id':
                employee.employee_id = trimmedValue;
                break;
              case 'address':
                employee.address = trimmedValue;
                break;
              case 'hire_date':
                employee.hire_date = this.parseDate(trimmedValue);
                break;
              case 'employee_type':
                employee.employee_type = this.mapEmployeeType(trimmedValue);
                break;
              case 'weekly_hours_required':
                employee.weekly_hours_required = this.parseNumber(trimmedValue);
                break;
              case 'notes':
                employee.notes = trimmedValue;
                break;
              case 'main_branch_id':
                employee.main_branch_id = this.findBranchId(trimmedValue, branches);
                break;
            }
          }
        }
      });

      // Validate required fields
      const validationErrors: string[] = [];
      
      if (!employee.first_name) {
        validationErrors.push('שם פרטי חובה');
      }
      
      if (!employee.last_name) {
        validationErrors.push('שם משפחה חובה');
      }

      // Set default employee type if not specified
      if (!employee.employee_type) {
        employee.employee_type = 'permanent';
      }

      // Check for duplicates
      const isDuplicate = existingEmployees.some(existing => {
        if (employee.id_number && existing.id_number) {
          return existing.id_number === employee.id_number;
        }
        if (employee.email && existing.email) {
          return existing.email.toLowerCase() === employee.email.toLowerCase();
        }
        return false;
      });

      if (isDuplicate) {
        validationErrors.push('עובד כבר קיים במערכת');
        employee.isDuplicate = true;
      }

      employee.validationErrors = validationErrors;
      employee.isValid = validationErrors.length === 0 && !isDuplicate;

      return employee as PreviewEmployee;
    });
  }

  private static parseDate(value: string): string | undefined {
    if (!value) return undefined;
    
    try {
      // Try to parse various date formats
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        // Try DD/MM/YYYY format
        const parts = value.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // Month is 0-indexed
          const year = parseInt(parts[2]);
          const parsedDate = new Date(year, month, day);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('T')[0];
          }
        }
        return undefined;
      }
      return date.toISOString().split('T')[0];
    } catch {
      return undefined;
    }
  }

  private static parseNumber(value: string): number | undefined {
    if (!value) return undefined;
    const num = parseInt(value);
    return isNaN(num) ? undefined : num;
  }

  private static mapEmployeeType(value: string): 'permanent' | 'temporary' | 'youth' | 'contractor' {
    const normalized = value.toLowerCase().trim();
    
    if (normalized.includes('קבוע') || normalized.includes('permanent')) {
      return 'permanent';
    }
    if (normalized.includes('זמני') || normalized.includes('temporary')) {
      return 'temporary';
    }
    if (normalized.includes('נוער') || normalized.includes('youth')) {
      return 'youth';
    }
    if (normalized.includes('קבלן') || normalized.includes('contractor')) {
      return 'contractor';
    }
    
    return 'permanent'; // Default
  }

  private static findBranchId(value: string, branches: any[]): string | undefined {
    if (!value || !branches.length) return undefined;
    
    const branch = branches.find(b => 
      b.name.toLowerCase().includes(value.toLowerCase()) ||
      value.toLowerCase().includes(b.name.toLowerCase())
    );
    
    return branch?.id;
  }
}
