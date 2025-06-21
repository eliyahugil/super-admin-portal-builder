
import type { PreviewEmployee, ImportResult, ImportStep } from '../types';

interface UseImportExecutionProps {
  businessId: string | null | undefined;
  previewData: PreviewEmployee[];
  setStep: (step: ImportStep) => void;
  setImportResult: (result: ImportResult) => void;
}

export const useImportExecution = ({
  businessId,
  previewData,
  setStep,
  setImportResult,
}: UseImportExecutionProps) => {
  
  const executeImport = async () => {
    console.log('🔄 useImportExecution - executeImport called:', {
      employeesCount: previewData.length,
      businessId
    });

    if (!businessId) {
      console.error('❌ No business ID available for import execution');
      throw new Error('לא נבחר עסק לביצוע הייבוא');
    }

    setStep('importing');

    try {
      // Filter valid employees only
      const validEmployees = previewData.filter(emp => emp.isValid && !emp.isDuplicate);
      
      console.log('📊 Import execution stats:', {
        total: previewData.length,
        valid: validEmployees.length,
        invalid: previewData.filter(emp => !emp.isValid).length,
        duplicates: previewData.filter(emp => emp.isDuplicate).length
      });

      // Simulate import process for now
      // In a real implementation, this would call the Supabase service
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result: ImportResult = {
        success: true,
        importedCount: validEmployees.length,
        errorCount: previewData.length - validEmployees.length,
        message: `יובאו בהצלחה ${validEmployees.length} עובדים`,
        errors: [],
        importedEmployees: validEmployees.map(emp => ({
          name: `${emp.first_name} ${emp.last_name}`,
          email: emp.email,
          branch: emp.main_branch_name
        }))
      };

      console.log('✅ Import execution completed:', result);

      setImportResult(result);
      setStep('results');
    } catch (error) {
      console.error('❌ Error in import execution:', error);
      
      const errorResult: ImportResult = {
        success: false,
        importedCount: 0,
        errorCount: previewData.length,
        message: 'הייבוא נכשל',
        errors: [{ row: 0, employee: 'כללי', error: error instanceof Error ? error.message : 'שגיאה לא ידועה' }],
        importedEmployees: []
      };

      setImportResult(errorResult);
      setStep('results');
    }
  };

  return {
    executeImport,
  };
};
