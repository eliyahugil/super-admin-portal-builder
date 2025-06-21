
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
      validEmployees: previewData.filter(emp => emp.isValid && !emp.isDuplicate).length
    });

    if (!businessId) {
      console.error('❌ No business ID available for import');
      throw new Error('לא נבחר עסק לייבוא');
    }

    try {
      setStep('importing');
      
      // Filter valid employees
      const validEmployees = previewData.filter(emp => emp.isValid && !emp.isDuplicate);
      console.log(`📋 Importing ${validEmployees.length} valid employees`);

      const importedEmployees: Array<{ name: string; email?: string; branch?: string }> = [];
      const errors: Array<{ row: number; employee: string; error: string }> = [];
      let successCount = 0;

      // Log current business ID
      console.log('🏢 Current business ID for import:', businessId);

      // Process employees in batches to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < validEmployees.length; i += batchSize) {
        const batch = validEmployees.slice(i, i + batchSize);
        console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(validEmployees.length / batchSize)}`);

        for (const employee of batch) {
          try {
            // Prepare employee data for insertion with proper type validation
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
              is_archived: false, // ✅ Explicitly set to false
            };

            console.log(`👤 About to insert employee:`, {
              name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
              email: employee.email,
              employee_id: employee.employee_id,
              employee_type: employeeData.employee_type,
              business_id: employeeData.business_id,
              is_active: employeeData.is_active,
              is_archived: employeeData.is_archived
            });

            const { data, error } = await supabase
              .from('employees')
              .insert([employeeData])
              .select('id, first_name, last_name, email, business_id, is_active, is_archived')
              .single();

            if (error) {
              console.error(`❌ Error inserting employee:`, {
                error: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                employeeData
              });
              errors.push({
                row: previewData.indexOf(employee) + 2,
                employee: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.email || 'לא ידוע',
                error: error.message
              });
              continue;
            }

            console.log(`✅ Successfully inserted employee:`, {
              id: data.id,
              name: `${data.first_name} ${data.last_name}`,
              business_id: data.business_id,
              is_active: data.is_active,
              is_archived: data.is_archived
            });

            // Store custom fields in the notes field if they exist (simplified approach)
            if (employee.customFields && Object.keys(employee.customFields).length > 0) {
              console.log(`🔧 Custom fields found for employee ${data.id}:`, employee.customFields);
              
              const customFieldsText = Object.entries(employee.customFields)
                .map(([key, value]) => `${key}: ${value}`)
                .join('; ');
              
              // Update notes with custom fields
              const currentNotes = employeeData.notes || '';
              const updatedNotes = currentNotes 
                ? `${currentNotes}\n\nשדות מותאמים: ${customFieldsText}`
                : `שדות מותאמים: ${customFieldsText}`;

              const { error: updateError } = await supabase
                .from('employees')
                .update({ notes: updatedNotes })
                .eq('id', data.id);

              if (updateError) {
                console.warn(`⚠️ Error updating notes with custom fields for employee ${data.id}:`, updateError);
              }
            }

            successCount++;
            importedEmployees.push({
              name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'לא ידוע',
              email: data.email || undefined,
              branch: employee.main_branch_id ? 'כן' : undefined
            });

          } catch (error) {
            console.error(`❌ Unexpected error importing employee:`, error);
            errors.push({
              row: previewData.indexOf(employee) + 2,
              employee: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.email || 'לא ידוע',
              error: error instanceof Error ? error.message : 'שגיאה לא ידועה'
            });
          }
        }

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < validEmployees.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // After all imports are done, let's verify what was actually saved
      console.log('🔍 Verifying imported employees in database...');
      const { data: savedEmployees, error: verifyError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email, business_id, is_active, is_archived')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (verifyError) {
        console.error('❌ Error verifying saved employees:', verifyError);
      } else {
        console.log('📊 Current employees in database for this business:', {
          totalCount: savedEmployees?.length || 0,
          recentEmployees: savedEmployees?.slice(0, 5).map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            email: emp.email,
            is_active: emp.is_active,
            is_archived: emp.is_archived
          }))
        });
      }

      const result: ImportResult = {
        success: successCount > 0,
        importedCount: successCount,
        errorCount: errors.length,
        message: successCount > 0 
          ? `יובאו בהצלחה ${successCount} עובדים${errors.length > 0 ? ` (${errors.length} שגיאות)` : ''}`
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
