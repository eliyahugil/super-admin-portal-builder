
import { useCallback } from 'react';
import { ExcelParserService } from '@/services/excel/ExcelParserService';
import type { ExcelRow, PreviewEmployee, ImportResult, ImportStep } from './types';
import type { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

interface UseImportFormProps {
  setStep: (step: ImportStep) => void;
  setFile: (file: File | null) => void;
  setRawData: (data: ExcelRow[]) => void;
  setHeaders: (headers: string[]) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setPreviewData: (data: PreviewEmployee[]) => void;
  setImportResult: (result: ImportResult) => void;
  setValidationErrors: (errors: any[]) => void;
  setDuplicateErrors: (errors: any[]) => void;
  setShowMappingDialog: (show: boolean) => void;
}

export const useImportForm = ({
  setStep,
  setFile,
  setRawData,
  setHeaders,
  setFieldMappings,
  setPreviewData,
  setImportResult,
  setValidationErrors,
  setDuplicateErrors,
  setShowMappingDialog,
}: UseImportFormProps) => {

  const resetForm = useCallback(() => {
    console.log('🔄 Resetting import form');
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setFieldMappings([]);
    setPreviewData([]);
    setImportResult({
      success: false,
      importedCount: 0,
      errorCount: 0,
      message: '',
      errors: [],
      importedEmployees: []
    });
    setValidationErrors([]);
    setDuplicateErrors([]);
    setShowMappingDialog(false);
  }, [
    setStep,
    setFile,
    setRawData,
    setHeaders,
    setFieldMappings,
    setPreviewData,
    setImportResult,
    setValidationErrors,
    setDuplicateErrors,
    setShowMappingDialog,
  ]);

  const downloadTemplate = useCallback(() => {
    console.log('📥 Downloading Excel template');
    ExcelParserService.generateTemplate();
  }, []);

  return {
    resetForm,
    downloadTemplate,
  };
};
