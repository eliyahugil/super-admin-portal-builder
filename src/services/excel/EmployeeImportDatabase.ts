
import { supabase } from '@/integrations/supabase/client';
import type { PreviewEmployee } from './EmployeeDataTransformer';

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  skippedCount?: number;
  duplicateCount?: number;
  message: string;
  errors?: Array<{
    row: number;
    employee: string;
    error: string;
  }>;
  importedEmployees?: Array<{
    name: string;
    email?: string;
    branch?: string;
  }>;
}

export class EmployeeImportDatabase {
  static async importEmployees(previewData: PreviewEmployee[]): Promise<ImportResult> {
    try {
      const validEmployees = previewData.filter(emp => emp.isValid && !emp.isDuplicate);
      const duplicateEmployees = previewData.filter(emp => emp.isDuplicate);
      const errorEmployees = previewData.filter(emp => !emp.isValid);

      if (validEmployees.length === 0) {
        return {
          success: false,
          importedCount: 0,
          errorCount: errorEmployees.length,
          duplicateCount: duplicateEmployees.length,
          message: validEmployees.length === 0 && duplicateEmployees.length > 0 
            ? 'כל העובדים כבר קיימים במערכת' 
            : 'לא נמצאו עובדים תקינים לייבוא',
          errors: errorEmployees.map(emp => ({
            row: emp.rowIndex,
            employee: `${emp.data.first_name || ''} ${emp.data.last_name || ''}`.trim(),
            error: emp.errors.join(', ')
          }))
        };
      }

      // Prepare employees for bulk insert
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

      // Bulk insert employees
      const { data: insertedEmployees, error: employeeError } = await supabase
        .from('employees')
        .insert(employeesToInsert)
        .select('id, first_name, last_name, email, main_branch_id');

      if (employeeError) {
        throw new Error(`שגיאה בייבוא עובדים: ${employeeError.message}`);
      }

      // Prepare custom field values for bulk insert
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

      // Bulk insert custom field values if any exist
      if (customFieldValues.length > 0) {
        const { error: customFieldError } = await supabase
          .from('custom_field_values')
          .insert(customFieldValues);

        if (customFieldError) {
          console.error('Error inserting custom fields:', customFieldError);
        }
      }

      // Get branch names for the imported employees
      const branchIds = insertedEmployees?.map(emp => emp.main_branch_id).filter(Boolean) || [];
      let branchNames: Record<string, string> = {};
      
      if (branchIds.length > 0) {
        const { data: branches } = await supabase
          .from('branches')
          .select('id, name')
          .in('id', branchIds);
        
        branchNames = branches?.reduce((acc, branch) => {
          acc[branch.id] = branch.name;
          return acc;
        }, {} as Record<string, string>) || {};
      }

      // Prepare imported employees summary
      const importedEmployeesData = insertedEmployees?.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`.trim(),
        email: emp.email,
        branch: emp.main_branch_id ? branchNames[emp.main_branch_id] : undefined
      })) || [];

      // Prepare error details
      const errorDetails = errorEmployees.map(emp => ({
        row: emp.rowIndex,
        employee: `${emp.data.first_name || ''} ${emp.data.last_name || ''}`.trim(),
        error: emp.errors.join(', ')
      }));

      return {
        success: true,
        importedCount: employeesToInsert.length,
        errorCount: errorEmployees.length,
        duplicateCount: duplicateEmployees.length,
        message: `${employeesToInsert.length} עובדים נוספו למערכת בהצלחה${duplicateEmployees.length > 0 ? `, ${duplicateEmployees.length} כפילויות דולגו` : ''}`,
        errors: errorDetails.length > 0 ? errorDetails : undefined,
        importedEmployees: importedEmployeesData
      };

    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        errorCount: previewData.length,
        message: error instanceof Error ? error.message : 'שגיאה לא צפויה בייבוא',
        errors: [{
          row: 0,
          employee: 'כלל הקובץ',
          error: error instanceof Error ? error.message : 'שגיאה לא צפויה'
        }]
      };
    }
  }
}
