
import { useCallback } from 'react';
import { ExcelParserService } from '@/services/excel/ExcelParserService';
import type { ImportStep, ExcelRow, PreviewEmployee, ImportResult, FieldMapping } from './types';

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

export const useImportForm = (props: UseImportFormProps) => {
  const {
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
  } = props;

  const resetForm = useCallback(() => {
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
    ExcelParserService.generateTemplate();
  }, []);

  return {
    resetForm,
    downloadTemplate,
  };
};
