
import { supabase } from '@/integrations/supabase/client';
import type { PreviewEmployee } from './EmployeeDataTransformer';

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  message: string;
}

export class EmployeeImportDatabase {
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
}
