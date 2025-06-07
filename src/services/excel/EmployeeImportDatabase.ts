
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
      // Filter employees by validation status
      const validEmployees = previewData.filter(emp => emp.isValid);
      const duplicateEmployees = previewData.filter(emp => emp.isDuplicate);
      const errorEmployees = previewData.filter(emp => !emp.isValid);

      console.log('Import filtering results:', {
        total: previewData.length,
        valid: validEmployees.length,
        duplicates: duplicateEmployees.length,
        errors: errorEmployees.length
      });

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

      // Prepare employees for upsert with enhanced data sanitization
      const employeesToUpsert = validEmployees.map(emp => {
        // Ensure employee_type is valid (already should be 'youth' from transformer)
        let employeeType = emp.data.employee_type || 'permanent';

        return {
          business_id: emp.data.business_id,
          first_name: emp.data.first_name?.toString().trim() || '',
          last_name: emp.data.last_name?.toString().trim() || '',
          email: emp.data.email?.toString().trim() || null,
          phone: emp.data.phone?.toString().trim() || null,
          id_number: emp.data.id_number?.toString().trim() || null,
          employee_id: emp.data.employee_id?.toString().trim() || null,
          address: emp.data.address?.toString().trim() || null,
          hire_date: emp.data.hire_date || null,
          employee_type: employeeType as 'permanent' | 'temporary' | 'contractor' | 'youth',
          weekly_hours_required: emp.data.weekly_hours_required || null,
          main_branch_id: emp.data.main_branch_id || null,
          notes: emp.data.notes?.toString().trim() || null,
          is_active: true
        };
      });

      console.log('Attempting to upsert employees:', employeesToUpsert.length);

      // Use upsert for handling duplicates automatically
      const { data: upsertedEmployees, error: employeeError } = await supabase
        .from('employees')
        .upsert(employeesToUpsert, { 
          onConflict: 'business_id,email',
          ignoreDuplicates: false 
        })
        .select('id, first_name, last_name, email, main_branch_id');

      if (employeeError) {
        console.error('Employee upsert error:', employeeError);
        throw new Error(`שגיאה בייבוא עובדים: ${employeeError.message}`);
      }

      console.log('Successfully upserted employees:', upsertedEmployees?.length);

      // Prepare custom field values for bulk insert
      const customFieldValues: any[] = [];
      validEmployees.forEach((emp, index) => {
        const employeeId = upsertedEmployees?.[index]?.id;
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
        console.log('Inserting custom field values:', customFieldValues.length);
        const { error: customFieldError } = await supabase
          .from('custom_field_values')
          .upsert(customFieldValues, { 
            onConflict: 'employee_id,field_name',
            ignoreDuplicates: false 
          });

        if (customFieldError) {
          console.error('Error upserting custom fields:', customFieldError);
          // Don't fail the entire import for custom field errors
        }
      }

      // Get branch names for the imported employees
      const branchIds = upsertedEmployees?.map(emp => emp.main_branch_id).filter(Boolean) || [];
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
      const importedEmployeesData = upsertedEmployees?.map(emp => ({
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

      const finalResult = {
        success: true,
        importedCount: employeesToUpsert.length,
        errorCount: errorEmployees.length,
        duplicateCount: duplicateEmployees.length,
        message: `${employeesToUpsert.length} עובדים נוספו/עודכנו במערכת בהצלחה${duplicateEmployees.length > 0 ? ` (כולל ${duplicateEmployees.length} עדכונים)` : ''}`,
        errors: errorDetails.length > 0 ? errorDetails : undefined,
        importedEmployees: importedEmployeesData
      };

      console.log('Import completed successfully:', finalResult);
      return finalResult;

    } catch (error) {
      console.error('Import failed with error:', error);
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
