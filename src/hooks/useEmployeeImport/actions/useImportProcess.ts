
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
    console.log('🚀 Starting final import process...');
    
    // Check authentication before starting import
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      console.error('❌ Authentication failed, aborting import');
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

    const validEmployees = previewData.filter(emp => emp.isValid);
    if (validEmployees.length === 0) {
      toast({
        title: 'אין עובדים לייבוא',
        description: 'לא נמצאו עובדים תקינים לייבוא למערכת',
        variant: 'destructive'
      });
      return;
    }

    setIsImporting(true);
    
    try {
      // Show initial progress toast
      toast({
        title: 'מתחיל ייבוא עובדים...',
        description: `מעבד ${validEmployees.length} עובדים למערכת`,
      });

      console.log('📤 Calling import service with valid employees:', validEmployees.length);
      
      // Double-check session before actual import
      const finalAuthCheck = await checkAuthSession();
      if (!finalAuthCheck) {
        console.error('❌ Final auth check failed');
        setIsImporting(false);
        return;
      }

      // Use the EmployeeImportDatabase service for actual import
      const result = await EmployeeImportDatabase.importEmployees(previewData);
      
      console.log('✅ Import completed with result:', result);
      setImportResult(result);
      
      if (result.success && result.importedCount > 0) {
        toast({
          title: 'ייבוא הושלם בהצלחה! 🎉',
          description: `${result.importedCount} עובדים נוספו/עודכנו במערכת`,
        });
      } else if (result.success && result.importedCount === 0) {
        toast({
          title: 'ייבוא הושלם',
          description: result.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'ייבוא הושלם עם שגיאות',
          description: result.message,
          variant: 'destructive'
        });
      }
      
      setStep('summary');
      
      // Refresh the employees list by triggering a page reload
      // This ensures the new data is visible immediately
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('employeesImported'));
      }, 1000);

    } catch (error) {
      console.error('💥 Import error:', error);
      const errorResult: ImportResult = {
        success: false,
        importedCount: 0,
        errorCount: previewData.length,
        message: error instanceof Error ? error.message : 'שגיאה לא צפויה בייבוא - אנא נסה שוב'
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
