
import { useBusiness } from '@/hooks/useBusiness';
import { useImportState } from './useEmployeeImport/useImportState';
import { useImportData } from './useEmployeeImport/useImportData';
import { useImportValidation } from './useEmployeeImport/useImportValidation';
import { useFileUpload } from './useEmployeeImport/actions/useFileUpload';
import { useFieldMapping } from './useEmployeeImport/useFieldMapping';
import { useImportManager } from './useEmployeeImport/useImportManager';
import { useImportForm } from './useEmployeeImport/useImportForm';
import { systemFields, employeeTypes } from './useEmployeeImport/constants';
import type { EmployeeImportHook } from './useEmployeeImport/types';

export type { ImportStep } from './useEmployeeImport/types';

export const useEmployeeImport = (): EmployeeImportHook => {
  const { businessId } = useBusiness();
  const state = useImportState();

  // Data fetching
  useImportData(businessId, state.setBranches, state.setExistingEmployees);

  // Validation logic
  const validation = useImportValidation({
    rawData: state.rawData,
    fieldMappings: state.fieldMappings,
    existingEmployees: state.existingEmployees,
    businessId,
    setValidationErrors: state.setValidationErrors,
    setDuplicateErrors: state.setDuplicateErrors,
  });

  // File upload handling
  const { handleFileUpload } = useFileUpload({
    setFile: state.setFile,
    setRawData: state.setRawData,
    setHeaders: state.setHeaders,
    setStep: state.setStep,
    setShowMappingDialog: state.setShowMappingDialog,
  });

  // Field mapping logic
  const { confirmMapping } = useFieldMapping({
    businessId,
    rawData: state.rawData,
    branches: state.branches,
    existingEmployees: state.existingEmployees,
    setFieldMappings: state.setFieldMappings,
    setPreviewData: state.setPreviewData,
    setStep: state.setStep,
    setShowMappingDialog: state.setShowMappingDialog,
  });

  // Import management
  const { executeImport } = useImportManager({
    previewData: state.previewData,
    validation,
    setIsImporting: state.setIsImporting,
    setImportResult: state.setImportResult,
    setStep: state.setStep,
  });

  // Form utilities
  const { resetForm, downloadTemplate } = useImportForm({
    setStep: state.setStep,
    setFile: state.setFile,
    setRawData: state.setRawData,
    setHeaders: state.setHeaders,
    setFieldMappings: state.setFieldMappings,
    setPreviewData: state.setPreviewData,
    setImportResult: state.setImportResult,
    setValidationErrors: state.setValidationErrors,
    setDuplicateErrors: state.setDuplicateErrors,
    setShowMappingDialog: state.setShowMappingDialog,
  });

  return {
    // State
    ...state,
    
    // Constants
    systemFields,
    employeeTypes,
    
    // Actions - using the new focused hooks
    handleFileUpload,
    handleMappingConfirm: confirmMapping,
    handleImport: executeImport,
    resetForm,
    downloadTemplate,
    
    // Validation methods
    runValidation: validation.runValidation,
    validateImportData: validation.validateImportData,
    getValidationSummary: validation.getValidationSummary,
    
    // Sample data for mapping dialog
    sampleData: state.rawData.slice(0, 5)
  };
};
