
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';
import type { ImportStep } from '../types';
import type { ExcelRow, PreviewEmployee, ImportResult } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';
import { initialImportResult } from '../constants';

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

interface UseImportUtilsProps {
  setStep: (step: ImportStep) => void;
  setFile: (file: File | null) => void;
  setRawData: (data: ExcelRow[]) => void;
  setHeaders: (headers: string[]) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setPreviewData: (data: PreviewEmployee[]) => void;
  setImportResult: (result: ImportResult) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  setDuplicateErrors: (errors: DuplicateError[]) => void;
  setShowMappingDialog: (show: boolean) => void;
}

export const useImportUtils = ({
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
}: UseImportUtilsProps) => {
  const { toast } = useToast();

  const resetForm = () => {
    console.log('🔄 Resetting import form');
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setFieldMappings([]);
    setPreviewData([]);
    setImportResult(initialImportResult);
    setValidationErrors([]);
    setDuplicateErrors([]);
    setShowMappingDialog(false);
  };

  const downloadTemplate = () => {
    console.log('📥 Generating Excel template');
    ExcelImportService.generateTemplate();
    toast({
      title: 'תבנית הורדה',
      description: 'קובץ התבנית הורד בהצלחה',
    });
  };

  return {
    resetForm,
    downloadTemplate,
  };
};
