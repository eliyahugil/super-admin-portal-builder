
import type { ImportStep, ImportActions, ImportValidation } from './types';
import type { ExcelRow, PreviewEmployee, ImportResult } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

import { useFileUpload } from './actions/useFileUpload';
import { useMappingConfirm } from './actions/useMappingConfirm';
import { useImportProcess } from './actions/useImportProcess';
import { useImportUtils } from './actions/useImportUtils';

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

  // File upload functionality
  const { handleFileUpload } = useFileUpload({
    setFile,
    setRawData,
    setHeaders,
    setStep,
    setShowMappingDialog,
  });

  // Mapping confirmation functionality
  const { handleMappingConfirm } = useMappingConfirm({
    businessId,
    rawData,
    branches,
    existingEmployees,
    validation,
    setFieldMappings,
    setShowMappingDialog,
    setPreviewData,
    setStep,
  });

  // Import process functionality
  const { handleImport } = useImportProcess({
    previewData,
    validation,
    setIsImporting,
    setImportResult,
    setStep,
  });

  // Utility functions
  const { resetForm, downloadTemplate } = useImportUtils({
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
  });

  return {
    handleFileUpload,
    handleMappingConfirm,
    handleImport,
    resetForm,
    downloadTemplate,
    setShowMappingDialog,
  };
};
