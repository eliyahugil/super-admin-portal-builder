
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import type { Employee } from '@/types/supabase';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

export interface ExcelRow {
  [key: string]: any;
}

export interface PreviewEmployee {
  rowIndex: number;
  data: Partial<Employee> & { business_id: string };
  customFields: Record<string, any>;
  isValid: boolean;
  errors: string[];
  isDuplicate?: boolean;
}

export interface ParsedExcelData {
  headers: string[];
  data: ExcelRow[];
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  message: string;
}

export class ExcelImportService {
  static parseExcelFile(file: File): Promise<ParsedExcelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            throw new Error('הקובץ חייב להכיל לפחות שורת כותרות ושורת נתונים אחת');
          }

          const headerRow = jsonData[0] as string[];
          const dataRows = jsonData.slice(1).filter(row => 
            Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== '')
          );

          const parsedData = dataRows.map((row: any) => {
            const obj: ExcelRow = {};
            headerRow.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          resolve({
            headers: headerRow,
            data: parsedData
          });
        } catch (error) {
          reject(new Error('שגיאה בקריאת הקובץ - אנא ודא שהקובץ הוא Excel תקין'));
        }
      };

      reader.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'));
      reader.readAsArrayBuffer(file);
    });
  }

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

  static async importEmployees(previewData: PreviewEmployee[]): Promise<ImportResult> {
    try {
      const validEmployees = previewData.filter(emp => emp.isValid && !emp.isDuplicate);

      if (validEmployees.length === 0) {
        return {
          success: false,
          importedCount: 0,
          errorCount: previewData.length,
          message: 'כל העובדים נפסלו או כפולים'
        };
      }

      // Insert employees
      const employeesToInsert = validEmployees.map(emp => ({
        business_id: emp.data.business_id,
        first_name: emp.data.first_name || '',
        last_name: emp.data.last_name || '',
        email: emp.data.email || null,
        phone: emp.data.phone || null,
        id_number: emp.data.id_number || null,
        employee_id: emp.data.employee_id || null,
        address: emp.data.address || null,
        hire_date: emp.data.hire_date || null,
        employee_type: emp.data.employee_type || 'permanent',
        weekly_hours_required: emp.data.weekly_hours_required || null,
        main_branch_id: emp.data.main_branch_id || null,
        notes: emp.data.notes || null,
        is_active: true
      }));

      const { data: insertedEmployees, error: employeeError } = await supabase
        .from('employees')
        .insert(employeesToInsert)
        .select();

      if (employeeError) {
        throw new Error(`שגיאה בייבוא עובדים: ${employeeError.message}`);
      }

      // Insert custom fields for employees that have them
      const customFieldValues: any[] = [];
      validEmployees.forEach((emp, index) => {
        const employeeId = insertedEmployees?.[index]?.id;
        if (employeeId && Object.keys(emp.customFields).length > 0) {
          Object.entries(emp.customFields).forEach(([fieldName, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              customFieldValues.push({
                employee_id: employeeId,
                field_name: fieldName,
                value: value.toString()
              });
            }
          });
        }
      });

      if (customFieldValues.length > 0) {
        const { error: customFieldError } = await supabase
          .from('custom_field_values')
          .insert(customFieldValues);

        if (customFieldError) {
          console.error('Error inserting custom fields:', customFieldError);
        }
      }

      return {
        success: true,
        importedCount: employeesToInsert.length,
        errorCount: previewData.length - employeesToInsert.length,
        message: `${employeesToInsert.length} עובדים נוספו למערכת בהצלחה`
      };

    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        errorCount: previewData.length,
        message: error instanceof Error ? error.message : 'שגיאה לא צפויה'
      };
    }
  }

  static generateTemplate(): void {
    const templateData = [
      ['שם פרטי', 'שם משפחה', 'אימייל', 'טלפון', 'מספר זהות', 'כתובת', 'תאריך תחילת עבודה', 'סניף', 'תפקיד', 'הערות'],
      ['יוסי', 'כהן', 'yossi@example.com', '0501234567', '123456789', 'תל אביב', '2024-01-15', 'סניף ראשי', 'עובד', 'עובד חדש']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'עובדים');
    XLSX.writeFile(wb, 'תבנית_עובדים.xlsx');
  }
}
