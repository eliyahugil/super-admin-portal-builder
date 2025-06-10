
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';
import { employeeTypes } from './constants';
import type { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

interface UseImportActionsProps {
  businessId: string | null;
  rawData: any[];
  branches: any[];
  existingEmployees: any[];
  previewData: any[];
  validation: any;
  setStep: (step: any) => void;
  setFile: (file: File | null) => void;
  setRawData: (data: any[]) => void;
  setHeaders: (headers: string[]) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setPreviewData: (data: any[]) => void;
  setIsImporting: (importing: boolean) => void;
  setShowMappingDialog: (show: boolean) => void;
  setImportResult: (result: any) => void;
  setValidationErrors: (errors: any[]) => void;
  setDuplicateErrors: (errors: any[]) => void;
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
}: UseImportActionsProps) => {
  const { toast } = useToast();

  const handleMappingConfirm = useCallback(async (mappings: FieldMapping[]) => {
    try {
      console.log('🎯 Starting mapping confirmation with mappings:', mappings.length);
      
      if (!businessId) {
        toast({
          title: 'שגיאה',
          description: 'לא נמצא מזהה עסק',
          variant: 'destructive'
        });
        return;
      }

      setFieldMappings(mappings);
      setShowMappingDialog(false);

      toast({
        title: 'מעבד נתונים...',
        description: 'יוצר תצוגה מקדימה של הנתונים',
      });

      const preview = ExcelImportService.generatePreview(
        rawData,
        mappings,
        businessId,
        branches,
        existingEmployees,
        employeeTypes
      );

      console.log('✅ Preview generated successfully:', {
        totalRows: preview.length,
        validRows: preview.filter(p => p.isValid).length,
        errorRows: preview.filter(p => !p.isValid).length
      });

      setPreviewData(preview);
      validation.runValidation();
      setStep('preview');

      toast({
        title: 'תצוגה מקדימה מוכנה! 📊',
        description: `נמצאו ${preview.length} עובדים לעיון ואישור`,
      });

    } catch (error) {
      console.error('💥 Error in mapping confirmation:', error);
      toast({
        title: 'שגיאה במיפוי שדות',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive'
      });
    }
  }, [rawData, businessId, branches, existingEmployees, toast, validation]);

  const resetForm = useCallback(() => {
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setFieldMappings([]);
    setPreviewData([]);
    setImportResult({ successful: 0, failed: 0, errors: [] });
    setValidationErrors([]);
    setDuplicateErrors([]);
    setShowMappingDialog(false);
  }, []);

  const downloadTemplate = useCallback(() => {
    ExcelImportService.downloadTemplate();
  }, []);

  const handleImport = useCallback(async () => {
    try {
      setIsImporting(true);
      
      const result = await ExcelImportService.importEmployees(previewData, businessId!);
      
      setImportResult(result);
      setStep('summary');
      
      if (result.successful > 0) {
        window.dispatchEvent(new CustomEvent('employeesImported'));
      }
      
    } catch (error) {
      console.error('Error importing employees:', error);
      toast({
        title: 'שגיאה בייבוא',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  }, [previewData, businessId, toast]);

  return {
    handleMappingConfirm,
    resetForm,
    downloadTemplate,
    handleImport,
  };
};
