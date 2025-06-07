
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';
import type { ImportStep, ImportActions, ImportValidation } from './types';
import type { ExcelRow, PreviewEmployee, ImportResult } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';
import { employeeTypes, initialImportResult } from './constants';

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

  const handleFileUpload = async (uploadedFile: File) => {
    try {
      console.log('Starting file upload process for:', uploadedFile.name);
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

  const handleMappingConfirm = (mappings: FieldMapping[]) => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'זיהוי עסק לא תקין',
        variant: 'destructive'
      });
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
      const result = await ExcelImportService.importEmployees(previewData);
      
      console.log('Import completed with result:', result);
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: 'ייבוא הושלם בהצלחה! 🎉',
          description: `${result.importedCount} עובדים נוספו למערכת`,
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
