
import { useBusiness } from '@/hooks/useBusiness';
import { useImportState } from './useEmployeeImport/useImportState';
import { useImportData } from './useEmployeeImport/useImportData';
import { useImportActions } from './useEmployeeImport/useImportActions';
import { useImportValidation } from './useEmployeeImport/useImportValidation';
import { useFileUpload } from './useEmployeeImport/actions/useFileUpload';
import { systemFields, employeeTypes } from './useEmployeeImport/constants';
import type { EmployeeImportHook } from './useEmployeeImport/types';

export type { ImportStep } from './useEmployeeImport/types';

export const useEmployeeImport = (): EmployeeImportHook => {
  const { businessId } = useBusiness();
  
  const {
    step,
    file,
    rawData,
    headers,
    fieldMappings,
    previewData,
    branches,
    existingEmployees,
    isImporting,
    showMappingDialog,
    importResult,
    validationErrors,
    duplicateErrors,
    setStep,
    setFile,
    setRawData,
    setHeaders,
    setFieldMappings,
    setPreviewData,
    setBranches,
    setExistingEmployees,
    setIsImporting,
    setShowMappingDialog,
    setImportResult,
    setValidationErrors,
    setDuplicateErrors,
  } = useImportState();

  // Fetch branches and existing employees
  useImportData(businessId, setBranches, setExistingEmployees);

  // Enhanced validation logic
  const validation = useImportValidation({
    rawData,
    fieldMappings,
    existingEmployees,
    businessId,
    setValidationErrors,
    setDuplicateErrors,
  });

  // Import actions with enhanced validation
  const actions = useImportActions({
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
  });

  // File upload handling
  const { handleFileUpload } = useFileUpload({
    setFile,
    setRawData,
    setHeaders,
    setStep,
    setShowMappingDialog,
  });

  return {
    // State
    step,
    file,
    rawData,
    headers,
    fieldMappings,
    previewData,
    branches,
    existingEmployees,
    isImporting,
    showMappingDialog,
    importResult,
    validationErrors,
    duplicateErrors,
    
    // Constants
    systemFields,
    employeeTypes,
    
    // Actions with enhanced validation
    handleFileUpload,
    handleMappingConfirm: actions.handleMappingConfirm,
    resetForm: actions.resetForm,
    downloadTemplate: actions.downloadTemplate,
    handleImport: actions.handleImport,
    setShowMappingDialog,
    
    // Enhanced validation methods
    runValidation: validation.runValidation,
    validateImportData: validation.validateImportData,
    getValidationSummary: validation.getValidationSummary,
    
    // Sample data for mapping dialog
    sampleData: rawData.slice(0, 5)
  };
};
