
import { supabase } from '@/integrations/supabase/client';
import type { PreviewEmployee, ImportResult, ImportStep } from '../types';

interface UseImportExecutionProps {
  businessId: string | null | undefined;
  previewData: PreviewEmployee[];
  setStep: (step: ImportStep) => void;
  setImportResult: (result: ImportResult) => void;
}

// Valid employee types according to Supabase enum
const VALID_EMPLOYEE_TYPES = ['permanent', 'temporary', 'youth', 'contractor'] as const;
type ValidEmployeeType = typeof VALID_EMPLOYEE_TYPES[number];

const normalizeEmployeeType = (type?: string): ValidEmployeeType => {
  if (!type) return 'permanent';
  
  const lowerType = type.toLowerCase().trim();
  
  // Map common variations to valid enum values
  const typeMapping: Record<string, ValidEmployeeType> = {
    'permanent': 'permanent',
    'קבוע': 'permanent',
    'full-time': 'permanent',
    'temporary': 'temporary',
    'זמני': 'temporary',
    'temp': 'temporary',
    'part-time': 'temporary',
    'youth': 'youth',
    'נוער': 'youth',
    'student': 'youth',
    'contractor': 'contractor',
    'קבלן': 'contractor',
    'freelancer': 'contractor',
  };
  
  return typeMapping[lowerType] || 'permanent';
};

export const useImportExecution = ({
  businessId,
  previewData,
  setStep,
  setImportResult,
}: UseImportExecutionProps) => {
  
  const executeImport = async () => {
    console.log('🚀 Starting import execution:', {
      businessId,
      totalEmployees: previewData.length,
      validEmployees: previewData.filter(emp => emp.isValid).length,
      newEmployees: previewData.filter(emp => emp.isValid && !emp.isPartialUpdate).length,
      partialUpdateEmployees: previewData.filter(emp => emp.isValid && emp.isPartialUpdate).length
    });

    if (!businessId) {
      console.error('❌ No business ID available for import');
      throw new Error('לא נבחר עסק לייבוא');
    }

    try {
      setStep('importing');
      
      // Filter employees - only valid ones
      const validEmployees = previewData.filter(emp => emp.isValid);
      const newEmployees = validEmployees.filter(emp => !emp.isPartialUpdate);
      const partialUpdateEmployees = validEmployees.filter(emp => emp.isPartialUpdate);
      const errorEmployees = previewData.filter(emp => !emp.isValid);

      console.log(`📋 Import breakdown:`, {
        total: previewData.length,
        valid: validEmployees.length,
        newEmployees: newEmployees.length,
        partialUpdates: partialUpdateEmployees.length,
        errors: errorEmployees.length
      });

      if (validEmployees.length === 0) {
        const result: ImportResult = {
          success: false,
          importedCount: 0,
          errorCount: errorEmployees.length,
          message: 'לא נמצאו עובדים תקינים לייבוא',
          errors: errorEmployees.map((emp, idx) => ({
            row: idx + 2,
            employee: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email || 'לא ידוע',
            error: emp.validationErrors?.join(', ') || 'שגיאה לא ידועה'
          })),
          importedEmployees: []
        };
        
        setImportResult(result);
        setStep('results');
        return;
      }

      const importedEmployees: Array<{ name: string; email?: string; branch?: string }> = [];
      const errors: Array<{ row: number; employee: string; error: string }> = [];
      let successCount = 0;
      let updateCount = 0;

      // Process employees in batches
      const batchSize = 5;
      for (let i = 0; i < validEmployees.length; i += batchSize) {
        const batch = validEmployees.slice(i, i + batchSize);
        console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(validEmployees.length / batchSize)}`);

        for (const employee of batch) {
          try {
            const employeeName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.email || 'לא ידוע';
            const originalRowIndex = previewData.indexOf(employee) + 2;

            if (employee.isPartialUpdate && employee.existingEmployeeId) {
              // Update existing employee - only empty fields
              console.log(`🔄 Updating existing employee ${employee.existingEmployeeId}: ${employeeName}`);
              
              // Get current employee data from database
              const { data: currentEmployee, error: fetchError } = await supabase
                .from('employees')
                .select('*')
                .eq('id', employee.existingEmployeeId)
                .eq('business_id', businessId)
                .single();

              if (fetchError || !currentEmployee) {
                console.error(`❌ Error fetching current employee data:`, fetchError);
                errors.push({
                  row: originalRowIndex,
                  employee: employeeName,
                  error: 'לא ניתן למצוא את העובד הקיים במסד הנתונים'
                });
                continue;
              }

              // Prepare update data - only fields that are empty in existing employee
              const updateData: any = {};
              
              const updatableFields = [
                'first_name', 'last_name', 'email', 'phone', 'id_number', 
                'employee_id', 'address', 'hire_date', 'employee_type', 
                'weekly_hours_required', 'main_branch_id', 'notes'
              ];
              
              let fieldsUpdated = 0;
              updatableFields.forEach(field => {
                const importValue = employee[field];
                const currentValue = currentEmployee[field];
                
                // Update only if current field is empty and import has value
                if ((!currentValue || currentValue === '' || currentValue === null) && 
                    importValue !== undefined && importValue !== null && importValue !== '') {
                  
                  if (field === 'employee_type') {
                    updateData[field] = normalizeEmployeeType(importValue);
                  } else if (field === 'weekly_hours_required') {
                    updateData[field] = importValue ? Number(importValue) : null;
                  } else {
                    updateData[field] = String(importValue).trim();
                  }
                  
                  fieldsUpdated++;
                  console.log(`📝 Will update ${field}: empty -> "${importValue}"`);
                }
              });

              if (fieldsUpdated > 0) {
                updateData.updated_at = new Date().toISOString();
                
                console.log(`📝 Updating employee with ${fieldsUpdated} fields:`, updateData);

                const { data, error } = await supabase
                  .from('employees')
                  .update(updateData)
                  .eq('id', employee.existingEmployeeId)
                  .eq('business_id', businessId)
                  .select('id, first_name, last_name, email')
                  .single();

                if (error) {
                  console.error(`❌ Error updating employee ${employee.existingEmployeeId}:`, error);
                  errors.push({
                    row: originalRowIndex,
                    employee: employeeName,
                    error: error.message
                  });
                  continue;
                }

                console.log(`✅ Successfully updated employee:`, data);
                updateCount++;
                successCount++;
                
                importedEmployees.push({
                  name: employeeName,
                  email: data.email || undefined,
                  branch: `עודכן (${fieldsUpdated} שדות)`
                });
              } else {
                console.log(`⚠️ No fields to update for employee ${employee.existingEmployeeId}`);
                // This shouldn't happen as we filter these out, but just in case
                errors.push({
                  row: originalRowIndex,
                  employee: employeeName,
                  error: 'אין שדות לעדכון'
                });
              }
              
            } else {
              // Create new employee
              const employeeData = {
                business_id: businessId,
                first_name: employee.first_name || '',
                last_name: employee.last_name || '',
                email: employee.email || null,
                phone: employee.phone || null,
                id_number: employee.id_number || null,
                employee_id: employee.employee_id || null,
                address: employee.address || null,
                hire_date: employee.hire_date || null,
                employee_type: normalizeEmployeeType(employee.employee_type),
                weekly_hours_required: employee.weekly_hours_required ? Number(employee.weekly_hours_required) : null,
                main_branch_id: employee.main_branch_id || null,
                notes: employee.notes || null,
                is_active: true,
                is_archived: false,
              };

              console.log(`👤 Inserting new employee: ${employeeName}`);

              const { data, error } = await supabase
                .from('employees')
                .insert([employeeData])
                .select('id, first_name, last_name, email')
                .single();

              if (error) {
                console.error(`❌ Error inserting employee:`, error);
                errors.push({
                  row: originalRowIndex,
                  employee: employeeName,
                  error: error.message
                });
                continue;
              }

              console.log(`✅ Successfully inserted employee:`, data);
              successCount++;
              
              importedEmployees.push({
                name: employeeName,
                email: data.email || undefined,
                branch: 'חדש'
              });
            }

          } catch (error) {
            console.error(`❌ Unexpected error processing employee:`, error);
            const employeeName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.email || 'לא ידוע';
            const originalRowIndex = previewData.indexOf(employee) + 2;
            
            errors.push({
              row: originalRowIndex,
              employee: employeeName,
              error: error instanceof Error ? error.message : 'שגיאה לא ידועה'
            });
          }
        }

        // Small delay between batches
        if (i + batchSize < validEmployees.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // Wait for database consistency
      await new Promise(resolve => setTimeout(resolve, 500));

      const result: ImportResult = {
        success: successCount > 0,
        importedCount: successCount,
        errorCount: errors.length,
        message: successCount > 0 
          ? `בוצע בהצלחה: ${successCount - updateCount} עובדים חדשים, ${updateCount} עדכונים${errors.length > 0 ? ` (${errors.length} שגיאות)` : ''}`
          : 'הייבוא נכשל - לא יובא אף עובד',
        errors,
        importedEmployees
      };

      console.log('📊 Import completed:', result);
      setImportResult(result);
      setStep('results');
      
    } catch (error) {
      console.error('❌ Import execution failed:', error);
      setImportResult({
        success: false,
        importedCount: 0,
        errorCount: previewData.length,
        message: error instanceof Error ? error.message : 'שגיאה לא ידועה בביצוע הייבוא',
        errors: [{
          row: 0,
          employee: 'כללי',
          error: error instanceof Error ? error.message : 'שגיאה לא ידועה'
        }],
        importedEmployees: []
      });
      setStep('results');
    }
  };

  return {
    executeImport,
  };
};
