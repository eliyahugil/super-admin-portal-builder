
import { supabase } from '@/integrations/supabase/client';
import type { PreviewEmployee, ImportResult } from '@/hooks/useEmployeeImport/types';

export class EmployeeImportService {
  static async importEmployees(employees: PreviewEmployee[]): Promise<ImportResult> {
    console.log('🚀 EmployeeImportService - Starting import:', employees.length);

    const errors: Array<{ row: number; employee: string; error: string }> = [];
    const importedEmployees: PreviewEmployee[] = [];
    let importedCount = 0;

    try {
      // Process employees in batches to avoid overwhelming the database
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < employees.length; i += batchSize) {
        batches.push(employees.slice(i, i + batchSize));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} employees`);

        for (let employeeIndex = 0; employeeIndex < batch.length; employeeIndex++) {
          const employee = batch[employeeIndex];
          const globalIndex = batchIndex * batchSize + employeeIndex;

          try {
            // Prepare employee data for insertion
            const employeeData = {
              business_id: employee.business_id,
              first_name: employee.first_name,
              last_name: employee.last_name,
              email: employee.email || null,
              phone: employee.phone || null,
              id_number: employee.id_number || null,
              employee_id: employee.employee_id || null,
              address: employee.address || null,
              hire_date: employee.hire_date || null,
              employee_type: employee.employee_type,
              weekly_hours_required: employee.weekly_hours_required || 0,
              main_branch_id: employee.main_branch_id || null,
              notes: employee.notes || null,
              is_active: true
            };

            console.log(`👤 Importing employee ${globalIndex + 1}: ${employee.first_name} ${employee.last_name}`);

            const { data, error } = await supabase
              .from('employees')
              .insert(employeeData)
              .select()
              .single();

            if (error) {
              console.error(`❌ Error importing employee ${globalIndex + 1}:`, error);
              errors.push({
                row: globalIndex + 1,
                employee: `${employee.first_name} ${employee.last_name}`,
                error: error.message
              });
            } else {
              console.log(`✅ Successfully imported employee ${globalIndex + 1}:`, data);
              importedEmployees.push({ ...employee, id: data.id });
              importedCount++;
            }

          } catch (err) {
            console.error(`💥 Unexpected error importing employee ${globalIndex + 1}:`, err);
            errors.push({
              row: globalIndex + 1,
              employee: `${employee.first_name} ${employee.last_name}`,
              error: 'שגיאה לא צפויה בייבוא'
            });
          }
        }

        // Add a small delay between batches to prevent overwhelming the database
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const success = importedCount > 0;
      const result: ImportResult = {
        success,
        importedCount,
        errorCount: errors.length,
        message: success 
          ? `יובאו בהצלחה ${importedCount} עובדים מתוך ${employees.length}`
          : `הייבוא נכשל. ${errors.length} שגיאות`,
        errors,
        importedEmployees
      };

      console.log('📊 EmployeeImportService - Import completed:', result);
      return result;

    } catch (error) {
      console.error('💥 EmployeeImportService - Critical error:', error);
      
      return {
        success: false,
        importedCount: 0,
        errorCount: employees.length,
        message: `שגיאה קריטית בייבוא: ${error instanceof Error ? error.message : 'שגיאה לא צפויה'}`,
        errors: [{
          row: 0,
          employee: 'כללי',
          error: error instanceof Error ? error.message : 'שגיאה לא צפויה'
        }],
        importedEmployees: []
      };
    }
  }
}
