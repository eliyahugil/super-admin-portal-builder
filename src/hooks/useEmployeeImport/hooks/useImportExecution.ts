
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';
import type { ImportStep, PreviewEmployee, ImportResult } from '../types';

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
    console.log('🚀 Starting import execution with data:', previewData.length);
    
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    if (previewData.length === 0) {
      toast({
        title: 'שגיאה',
        description: 'אין נתוני עובדים לייבוא',
        variant: 'destructive',
      });
      return;
    }

    try {
      setStep('importing');

      // Filter only valid employees for import
      const validEmployees = previewData.filter(emp => emp.isValid && !emp.isDuplicate);
      
      if (validEmployees.length === 0) {
        toast({
          title: 'שגיאה',
          description: 'אין עובדים תקינים לייבוא',
          variant: 'destructive',
        });
        setStep('preview');
        return;
      }

      console.log('📤 Importing valid employees:', validEmployees.length);
      
      // Use the EmployeeImportService
      const result = await ExcelImportService.importEmployees(validEmployees);
      
      console.log('📊 Import execution completed:', result);
      
      setImportResult(result);
      setStep('results');

      if (result.success) {
        toast({
          title: 'הצלחה! 🎉',
          description: `יובאו בהצלחה ${result.importedCount} עובדים`,
        });
        
        // Refresh the employees list
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('employeesImported'));
        }, 1000);
      } else {
        toast({
          title: 'הייבוא הסתיים עם שגיאות',
          description: result.message,
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('💥 Error in executeImport:', error);
      
      const errorResult: ImportResult = {
        success: false,
        importedCount: 0,
        errorCount: previewData.length,
        message: `שגיאה בייבוא: ${error instanceof Error ? error.message : 'שגיאה לא צפויה'}`,
        errors: [{
          row: 0,
          employee: 'כללי',
          error: error instanceof Error ? error.message : 'שגיאה לא צפויה'
        }],
        importedEmployees: []
      };

      setImportResult(errorResult);
      setStep('results');

      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בייבוא העובדים',
        variant: 'destructive',
      });
    }
  }, [businessId, previewData, setStep, setImportResult, toast]);

  return {
    executeImport,
  };
};
