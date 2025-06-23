
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
      validEmployees: previewData.filter(emp => emp.isValid && !emp.isDuplicate).length,
      partialUpdateEmployees: previewData.filter(emp => emp.isValid && emp.isPartialUpdate).length
    });

    if (!businessId) {
      console.error('❌ No business ID available for import');
      throw new Error('לא נבחר עסק לייבוא');
    }

    try {
      setStep('importing');
      
      // Filter employees - include both new employees and partial updates
      const validEmployees = previewData.filter(emp => emp.isValid && !emp.isDuplicate);
      const partialUpdateEmployees = previewData.filter(emp => emp.isValid && emp.isPartialUpdate);
      const newEmployees = previewData.filter(emp => emp.isValid && !emp.isDuplicate && !emp.isPartialUpdate);
      const errorEmployees = previewData.filter(emp => !emp.isValid);

      console.log(`📋 Import breakdown:`, {
        total: previewData.length,
        newEmployees: newEmployees.length,
        partialUpdates: partialUpdateEmployees.length,
        errors: errorEmployees.length
      });

      if (validEmployees.length === 0) {
        return {
          success: false,
          importedCount: 0,
          errorCount: errorEmployees.length,
          message: 'לא נמצאו עובדים תקינים לייבוא',
          errors: errorEmployees.map(emp => ({
            row: previewData.indexOf(emp) + 2,
            employee: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
            error: emp.validationErrors.join(', ')
          }))
        };
      }

      const importedEmployees: Array<{ name: string; email?: string; branch?: string }> = [];
      const errors: Array<{ row: number; employee: string; error: string }> = [];
      let successCount = 0;
      let updateCount = 0;

      // Process employees in batches
      const batchSize = 10;
      for (let i = 0; i < validEmployees.length; i += batchSize) {
        const batch = validEmployees.slice(i, i + batchSize);
        console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(validEmployees.length / batchSize)}`);

        for (const employee of batch) {
          try {
            if (employee.isPartialUpdate && employee.existingEmployeeId) {
              // Update existing employee with only new data
              console.log(`🔄 Updating existing employee ${employee.existingEmployeeId}`);
              
              // Prepare update data - only include fields that have values
              const updateData: any = {};
              
              // List of fields that can be updated
              const updatableFields = [
                'first_name', 'last_name', 'email', 'phone', 'id_number', 
                'employee_id', 'address', 'hire_date', 'employee_type', 
                'weekly_hours_required', 'main_branch_id', 'notes'
              ];
              
              updatableFields.forEach(field => {
                if (employee[field] !== undefined && employee[field] !== null && employee[field] !== '') {
                  if (field === 'employee_type') {
                    updateData[field] = normalizeEmployeeType(employee[field]);
                  } else if (field === 'weekly_hours_required') {
                    updateData[field] = employee[field] ? Number(employee[field]) : null;
                  } else {
                    updateData[field] = employee[field].toString().trim();
                  }
                }
              });

              // Only proceed with update if there's actually data to update
              if (Object.keys(updateData).length > 0) {
                updateData.updated_at = new Date().toISOString();
                
                console.log(`📝 Updating employee with data:`, updateData);

                const { data, error } = await supabase
                  .from('employees')
                  .update(updateData)
                  .eq('id', employee.existingEmployeeId)
                  .eq('business_id', businessId)
                  .select('id, first_name, last_name, email, business_id, is_active, is_archived')
                  .single();

                if (error) {
                  console.error(`❌ Error updating employee ${employee.existingEmployeeId}:`, error);
                  errors.push({
                    row: previewData.indexOf(employee) + 2,
                    employee: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.email || 'לא ידוע',
                    error: error.message
                  });
                  continue;
                }

                console.log(`✅ Successfully updated employee:`, data);
                updateCount++;
                successCount++;
                
                importedEmployees.push({
                  name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'לא ידוע',
                  email: data.email || undefined,
                  branch: employee.main_branch_id ? 'עודכן' : undefined
                });
              } else {
                console.log(`⚠️ No new data to update for employee ${employee.existingEmployeeId}`);
              }
              
            } else {
              // Insert new employee
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

              console.log(`👤 Inserting new employee:`, {
                name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
                email: employee.email,
                employee_id: employee.employee_id,
                employee_type: employeeData.employee_type,
                business_id: employeeData.business_id
              });

              const { data, error } = await supabase
                .from('employees')
                .insert([employeeData])
                .select('id, first_name, last_name, email, business_id, is_active, is_archived')
                .single();

              if (error) {
                console.error(`❌ Error inserting employee:`, error);
                errors.push({
                  row: previewData.indexOf(employee) + 2,
                  employee: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.email || 'לא ידוע',
                  error: error.message
                });
                continue;
              }

              console.log(`✅ Successfully inserted employee:`, data);
              successCount++;
              
              importedEmployees.push({
                name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'לא ידוע',
                email: data.email || undefined,
                branch: employee.main_branch_id ? 'כן' : undefined
              });
            }

            // Handle custom fields for both new and updated employees
            if (employee.customFields && Object.keys(employee.customFields).length > 0) {
              const employeeId = employee.isPartialUpdate ? employee.existingEmployeeId : null; // Will be set from insert result
              
              if (employeeId) {
                console.log(`🔧 Processing custom fields for employee ${employeeId}:`, employee.customFields);
                
                const customFieldsText = Object.entries(employee.customFields)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('; ');
                
                // For now, append custom fields to notes (simplified approach)
                const { error: notesError } = await supabase
                  .from('employees')
                  .update({ 
                    notes: `${employee.notes || ''}\n\nשדות מותאמים: ${customFieldsText}`.trim()
                  })
                  .eq('id', employeeId);

                if (notesError) {
                  console.warn(`⚠️ Error updating notes with custom fields:`, notesError);
                }
              }
            }

          } catch (error) {
            console.error(`❌ Unexpected error processing employee:`, error);
            errors.push({
              row: previewData.indexOf(employee) + 2,
              employee: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.email || 'לא ידוע',
              error: error instanceof Error ? error.message : 'שגיאה לא ידועה'
            });
          }
        }

        // Small delay between batches
        if (i + batchSize < validEmployees.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
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
