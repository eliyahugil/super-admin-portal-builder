
import { useBusiness } from '@/hooks/useBusiness';
import { useImportState } from './useImportState';
import { useImportData } from './useImportData';
import { useImportActions } from './useImportActions';
import { useImportValidation } from './useImportValidation';
import { useFileUpload } from './actions/useFileUpload';
import { systemFields, employeeTypes } from './constants';
import type { EmployeeImportHook } from './types';

export type { ImportStep } from './types';

export const useEmployeeImport = (): EmployeeImportHook => {
  const { businessId } = useBusiness();
  
  const state = useImportState();

  // Fetch branches and existing employees
  useImportData(businessId, state.setBranches, state.setExistingEmployees);

  // Enhanced validation logic
  const validation = useImportValidation({
    rawData: state.rawData,
    fieldMappings: state.fieldMappings,
    existingEmployees: state.existingEmployees,
    businessId,
    setValidationErrors: state.setValidationErrors,
    setDuplicateErrors: state.setDuplicateErrors,
  });

  // Import actions
  const actions = useImportActions({
    businessId,
    rawData: state.rawData,
    branches: state.branches,
    existingEmployees: state.existingEmployees,
    previewData: state.previewData,
    validation,
    setStep: state.setStep,
    setFile: state.setFile,
    setRawData: state.setRawData,
    setHeaders: state.setHeaders,
    setFieldMappings: state.setFieldMappings,
    setPreviewData: state.setPreviewData,
    setIsImporting: state.setIsImporting,
    setShowMappingDialog: state.setShowMappingDialog,
    setImportResult: state.setImportResult,
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

  return {
    // State
    ...state,
    
    // Constants
    systemFields,
    employeeTypes,
    
    // Actions
    handleFileUpload,
    ...actions,
    
    // Validation methods
    ...validation,
    
    // Sample data for mapping dialog
    sampleData: state.rawData.slice(0, 5)
  };
};
