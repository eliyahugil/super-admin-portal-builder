
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
    console.log('🚀 executeImport called with:', {
      businessId,
      previewDataCount: previewData.length,
      sampleData: previewData.slice(0, 2)
    });
    
    if (!businessId) {
      console.error('❌ No business ID found');
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    if (previewData.length === 0) {
      console.error('❌ No preview data found');
      toast({
        title: 'שגיאה',
        description: 'אין נתוני עובדים לייבוא',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('📈 Setting step to importing');
      setStep('importing');

      // Filter only valid employees for import
      const validEmployees = previewData.filter(emp => emp.isValid && !emp.isDuplicate);
      
      console.log('✅ Valid employees for import:', validEmployees.length);
      
      if (validEmployees.length === 0) {
        console.error('❌ No valid employees to import');
        toast({
          title: 'שגיאה',
          description: 'אין עובדים תקינים לייבוא',
          variant: 'destructive',
        });
        setStep('preview');
        return;
      }

      console.log('📤 Calling ExcelImportService.importEmployees');
      
      // Use the EmployeeImportService
      const result = await ExcelImportService.importEmployees(validEmployees);
      
      console.log('📊 Import execution completed with result:', result);
      
      setImportResult(result);
      setStep('results');

      if (result.success) {
        console.log('🎉 Import successful!');
        toast({
          title: 'הצלחה! 🎉',
          description: `יובאו בהצלחה ${result.importedCount} עובדים`,
        });
        
        // Refresh the employees list
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('employeesImported'));
        }, 1000);
      } else {
        console.log('⚠️ Import completed with errors');
        toast({
          title: 'הייבוא הסתיים עם שגיאות',
          description: result.message,
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('💥 Critical error in executeImport:', error);
      
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
