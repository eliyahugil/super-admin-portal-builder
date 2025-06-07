import { useToast } from '@/hooks/use-toast';
import { EmployeeImportDatabase } from '@/services/excel/EmployeeImportDatabase';
import type { ImportStep, ImportActions, ImportValidation } from './types';
import type { ExcelRow, PreviewEmployee, ImportResult } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';
import { employeeTypes, initialImportResult } from './constants';
import { ExcelImportService } from '@/services/ExcelImportService';
import { supabase } from '@/integrations/supabase/client';

interface ValidationError {
  rowIndex: number;
  field: string;
  error: string;
  severity: 'error' | 'warning';
}

interface DuplicateError {
  rowIndex: number;
  duplicateField: string;
  existingValue: string;
  severity: 'error' | 'warning';
}

interface UseImportActionsProps {
  businessId: string | null;
  rawData: ExcelRow[];
  branches: any[];
  existingEmployees: any[];
  previewData: PreviewEmployee[];
  validation: ImportValidation;
  setStep: (step: ImportStep) => void;
  setFile: (file: File | null) => void;
  setRawData: (data: ExcelRow[]) => void;
  setHeaders: (headers: string[]) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setPreviewData: (data: PreviewEmployee[]) => void;
  setIsImporting: (importing: boolean) => void;
  setShowMappingDialog: (show: boolean) => void;
  setImportResult: (result: ImportResult) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  setDuplicateErrors: (errors: DuplicateError[]) => void;
}

export const useImportActions = ({
  businessId,
  rawData,
  branches,
  existingEmployees,
  previewData,
  validation,
  setStep,
  setFile,
  setRawData,
  setHeaders,
  setFieldMappings,
  setPreviewData,
  setIsImporting,
  setShowMappingDialog,
  setImportResult,
  setValidationErrors,
  setDuplicateErrors,
}: UseImportActionsProps): ImportActions => {
  const { toast } = useToast();

  // Helper function to check authentication
  const checkAuthSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session check error:', error);
        toast({
          title: 'שגיאת אותנטיקציה',
          description: 'נדרש להתחבר מחדש למערכת',
          variant: 'destructive'
        });
        return false;
      }

      if (!session?.access_token) {
        console.warn('⚠️ No valid session found');
        toast({
          title: 'נדרש להתחבר מחדש',
          description: 'הסשן פג תוקף - אנא התחבר מחדש כדי להמשיך',
          variant: 'destructive'
        });
        return false;
      }

      console.log('✅ Valid session confirmed');
      return true;
    } catch (error) {
      console.error('💥 Authentication check failed:', error);
      toast({
        title: 'שגיאת מערכת',
        description: 'לא ניתן לאמת את הסשן - אנא רענן את הדף',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleFileUpload = async (uploadedFile: File) => {
    try {
      console.log('Starting file upload process for:', uploadedFile.name);
      
      // Check authentication before proceeding
      const isAuthenticated = await checkAuthSession();
      if (!isAuthenticated) {
        return;
      }

      setFile(uploadedFile);
      
      const parsedData = await ExcelImportService.parseExcelFile(uploadedFile);
      console.log('Excel file parsed successfully:', {
        headers: parsedData.headers.length,
        rows: parsedData.data.length
      });
      
      setHeaders(parsedData.headers);
      setRawData(parsedData.data);
      setStep('mapping');
      setShowMappingDialog(true);
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'שגיאה בקריאת הקובץ',
        description: error instanceof Error ? error.message : 'אנא ודא שהקובץ הוא Excel תקין',
        variant: 'destructive'
      });
    }
  };

  const handleMappingConfirm = async (mappings: FieldMapping[]) => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'זיהוי עסק לא תקין',
        variant: 'destructive'
      });
      return;
    }

    // Check authentication before proceeding with mapping
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return;
    }
    
    console.log('Mapping confirmed, generating preview...');
    setFieldMappings(mappings);
    setShowMappingDialog(false);
    
    // Generate preview with enhanced validation
    const preview = ExcelImportService.generatePreview(
      rawData,
      mappings,
      businessId,
      branches,
      existingEmployees,
      employeeTypes
    );
    
    console.log('Preview generated:', {
      total: preview.length,
      valid: preview.filter(p => p.isValid).length,
      duplicates: preview.filter(p => p.isDuplicate).length
    });
    
    setPreviewData(preview);
    
    // Trigger advanced validation
    setTimeout(() => {
      validation.validateImportData();
    }, 100);
    
    setStep('preview');
  };

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

  const resetForm = () => {
    console.log('Resetting import form');
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setFieldMappings([]);
    setPreviewData([]);
    setImportResult(initialImportResult);
    setValidationErrors([]);
    setDuplicateErrors([]);
  };

  const downloadTemplate = () => {
    console.log('Generating Excel template');
    ExcelImportService.generateTemplate();
    toast({
      title: 'תבנית הורדה',
      description: 'קובץ התבנית הורד בהצלחה',
    });
  };

  return {
    handleFileUpload,
    handleMappingConfirm,
    handleImport,
    resetForm,
    downloadTemplate,
    setShowMappingDialog,
  };
};
