
import { useToast } from '@/hooks/use-toast';
import { EmployeeImportDatabase } from '@/services/excel/EmployeeImportDatabase';
import type { ImportStep, ImportValidation } from '../types';
import type { PreviewEmployee, ImportResult } from '@/services/ExcelImportService';
import { useAuthUtils } from '../utils/authUtils';

interface UseImportProcessProps {
  previewData: PreviewEmployee[];
  validation: ImportValidation;
  setIsImporting: (importing: boolean) => void;
  setImportResult: (result: ImportResult) => void;
  setStep: (step: ImportStep) => void;
}

export const useImportProcess = ({
  previewData,
  validation,
  setIsImporting,
  setImportResult,
  setStep,
}: UseImportProcessProps) => {
  const { toast } = useToast();
  const { checkAuthSession } = useAuthUtils();

  const handleImport = async () => {
    console.log('Starting import process...');
    
    // Check authentication before starting import
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return;
    }
    
    // Final validation before import
    if (!validation.validateImportData()) {
      toast({
        title: 'שגיאות בולידציה',
        description: 'אנא תקן את השגיאות הקריטיות לפני הייבוא',
        variant: 'destructive'
      });
      return;
    }

    setIsImporting(true);
    
    try {
      // Show initial progress toast
      toast({
        title: 'מתחיל ייבוא',
        description: 'מעבד את הנתונים...',
      });

      console.log('Calling import service with preview data:', previewData.length);
      
      // Double-check session before actual import
      const finalAuthCheck = await checkAuthSession();
      if (!finalAuthCheck) {
        setIsImporting(false);
        return;
      }

      // Use the new EmployeeImportDatabase service
      const result = await EmployeeImportDatabase.importEmployees(previewData);
      
      console.log('Import completed with result:', result);
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: 'ייבוא הושלם בהצלחה! 🎉',
          description: `${result.importedCount} עובדים נוספו/עודכנו במערכת`,
        });
      } else {
        toast({
          title: 'ייבוא הושלם עם שגיאות',
          description: result.message,
          variant: 'destructive'
        });
      }
      
      setStep('summary');
    } catch (error) {
      console.error('Import error:', error);
      const errorResult: ImportResult = {
        success: false,
        importedCount: 0,
        errorCount: previewData.length,
        message: error instanceof Error ? error.message : 'שגיאה לא צפויה - אנא נסה שוב'
      };
      setImportResult(errorResult);
      setStep('summary');
      
      toast({
        title: 'שגיאה בייבוא',
        description: 'שגיאה לא צפויה - אנא נסה שוב',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  return { handleImport };
};
