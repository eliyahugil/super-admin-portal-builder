
import { supabase } from '@/integrations/supabase/client';
import type { PreviewEmployee, ImportResult } from '@/hooks/useEmployeeImport/types';

export class EmployeeImportService {
  static async importEmployees(employees: PreviewEmployee[]): Promise<ImportResult> {
    console.log('🚀 EmployeeImportService - Starting import process');
    console.log('📊 Input employees data:', {
      totalCount: employees.length,
      validCount: employees.filter(emp => emp.isValid).length,
      duplicateCount: employees.filter(emp => emp.isDuplicate).length,
      invalidCount: employees.filter(emp => !emp.isValid).length,
      sampleEmployee: employees[0] ? {
        first_name: employees[0].first_name,
        last_name: employees[0].last_name,
        business_id: employees[0].business_id,
        isValid: employees[0].isValid,
        isDuplicate: employees[0].isDuplicate
      } : null
    });

    const errors: Array<{ row: number; employee: string; error: string }> = [];
    const importedEmployees: Array<{ name: string; email?: string; branch?: string }> = [];
    let importedCount = 0;

    try {
      // Process employees in batches to avoid overwhelming the database
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < employees.length; i += batchSize) {
        batches.push(employees.slice(i, i + batchSize));
      }

      console.log(`📦 Processing ${batches.length} batches of employees`);

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} employees`);

        for (let employeeIndex = 0; employeeIndex < batch.length; employeeIndex++) {
          const employee = batch[employeeIndex];
          const globalIndex = batchIndex * batchSize + employeeIndex;

          console.log(`👤 Processing employee ${globalIndex + 1}:`, {
            name: `${employee.first_name} ${employee.last_name}`,
            business_id: employee.business_id,
            isValid: employee.isValid,
            isDuplicate: employee.isDuplicate
          });

          // Skip invalid or duplicate employees
          if (!employee.isValid || employee.isDuplicate) {
            console.log(`⏭️ Skipping employee ${globalIndex + 1} - not valid or duplicate`);
            continue;
          }

          try {
            // Prepare employee data for insertion
            const employeeData = {
              business_id: employee.business_id,
              first_name: employee.first_name?.toString().trim() || '',
              last_name: employee.last_name?.toString().trim() || '',
              email: employee.email?.toString().trim() || null,
              phone: employee.phone?.toString().trim() || null,
              id_number: employee.id_number?.toString().trim() || null,
              employee_id: employee.employee_id?.toString().trim() || null,
              address: employee.address?.toString().trim() || null,
              hire_date: employee.hire_date || null,
              employee_type: employee.employee_type || 'permanent',
              weekly_hours_required: employee.weekly_hours_required || 0,
              main_branch_id: employee.main_branch_id || null,
              notes: employee.notes?.toString().trim() || null,
              is_active: true
            };

            console.log(`💾 Inserting employee ${globalIndex + 1} with data:`, employeeData);

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
              importedEmployees.push({
                name: `${employee.first_name} ${employee.last_name}`,
                email: employee.email,
                branch: employee.main_branch_id
              });
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
