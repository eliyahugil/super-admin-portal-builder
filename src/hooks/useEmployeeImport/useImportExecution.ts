
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EmployeeImportService } from '@/services/excel/EmployeeImportService';
import type { PreviewEmployee, ImportResult, ImportStep } from './types';

interface UseImportExecutionProps {
  businessId: string | null;
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
  const { toast } = useToast();

  const executeImport = useCallback(async () => {
    try {
      console.log('🚀 Starting import execution');
      
      if (!businessId) {
        toast({
          title: 'שגיאה',
          description: 'לא נמצא מזהה עסק',
          variant: 'destructive'
        });
        return;
      }

      if (!previewData || previewData.length === 0) {
        toast({
          title: 'שגיאה',
          description: 'אין נתונים לייבוא',
          variant: 'destructive'
        });
        return;
      }

      setStep('importing');

      toast({
        title: 'מייבא עובדים...',
        description: 'אנא המתן, זה עלול לקחת כמה רגעים',
      });

      // Filter only valid employees for import
      const validEmployees = previewData.filter(emp => emp.isValid && !emp.isDuplicate);
      console.log('✅ Valid employees for import:', validEmployees.length);

      // Execute the import
      const result = await EmployeeImportService.importEmployees(validEmployees);
      console.log('📊 Import result:', result);

      setImportResult(result);
      setStep('results');

      if (result.success) {
        toast({
          title: 'ייבוא הושלם בהצלחה! 🎉',
          description: `יובאו ${result.importedCount} עובדים מתוך ${previewData.length}`,
        });
      } else {
        toast({
          title: 'הייבוא נכשל',
          description: result.message,
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('💥 Import execution error:', error);
      
      const errorResult: ImportResult = {
        success: false,
        importedCount: 0,
        errorCount: previewData.length,
        message: error instanceof Error ? error.message : 'שגיאה לא צפויה בייבוא',
        errors: [{
          row: 0,
          message: error instanceof Error ? error.message : 'שגיאה לא צפויה'
        }],
        importedEmployees: []
      };

      setImportResult(errorResult);
      setStep('results');

      toast({
        title: 'שגיאה בייבוא',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive'
      });
    }
  }, [businessId, previewData, setStep, setImportResult, toast]);

  return {
    executeImport,
  };
};
