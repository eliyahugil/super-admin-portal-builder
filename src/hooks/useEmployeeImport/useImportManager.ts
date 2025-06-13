
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EmployeeImportDatabase } from '@/services/excel/EmployeeImportDatabase';
import type { PreviewEmployee, ImportResult } from './types';
import type { ImportStep, ImportValidation } from './types';

interface UseImportManagerProps {
  previewData: PreviewEmployee[];
  validation: ImportValidation;
  setIsImporting: (importing: boolean) => void;
  setImportResult: (result: ImportResult) => void;
  setStep: (step: ImportStep) => void;
}

export const useImportManager = ({
  previewData,
  validation,
  setIsImporting,
  setImportResult,
  setStep,
}: UseImportManagerProps) => {
  const { toast } = useToast();

  const executeImport = useCallback(async () => {
    console.log('🚀 Starting final import process...');
    
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
      toast({
        title: 'מתחיל ייבוא עובדים...',
        description: `מעבד ${validEmployees.length} עובדים למערכת`,
      });

      console.log('📤 Calling import service with valid employees:', validEmployees.length);
      
      // Transform PreviewEmployee to the format expected by EmployeeImportDatabase
      const transformedEmployees = validEmployees.map(emp => ({
        rowIndex: 0, // Add default rowIndex
        data: {
          business_id: emp.business_id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          email: emp.email,
          phone: emp.phone,
          id_number: emp.id_number,
          employee_id: emp.employee_id,
          address: emp.address,
          hire_date: emp.hire_date,
          employee_type: emp.employee_type,
          weekly_hours_required: emp.weekly_hours_required,
          main_branch_id: emp.main_branch_id,
          notes: emp.notes,
        },
        customFields: {},
        isValid: emp.isValid,
        isDuplicate: emp.isDuplicate || false,
        hasWarnings: false,
        errors: emp.validationErrors || [],
        warnings: [],
      }));
      
      const dbResult = await EmployeeImportDatabase.importEmployees(transformedEmployees);
      
      // Transform the result to match our expected ImportResult type
      const result: ImportResult = {
        success: dbResult.success,
        importedCount: dbResult.importedCount,
        errorCount: dbResult.errorCount,
        message: dbResult.message,
        errors: dbResult.errors || [],
        importedEmployees: dbResult.importedEmployees || []
      };
      
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
      
      // Refresh the employees list
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('employeesImported'));
      }, 1000);

    } catch (error) {
      console.error('💥 Import error:', error);
      const errorResult: ImportResult = {
        success: false,
        importedCount: 0,
        errorCount: previewData.length,
        message: error instanceof Error ? error.message : 'שגיאה לא צפויה בייבוא - אנא נסה שוב',
        errors: [{
          row: 0,
          employee: 'כללי',
          error: error instanceof Error ? error.message : 'שגיאה לא צפויה'
        }],
        importedEmployees: []
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
  }, [previewData, validation, toast, setIsImporting, setImportResult, setStep]);

  return {
    executeImport,
  };
};
