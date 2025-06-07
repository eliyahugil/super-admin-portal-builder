
import { useBusiness } from '@/hooks/useBusiness';
import { useImportState } from './useEmployeeImport/useImportState';
import { useImportData } from './useEmployeeImport/useImportData';
import { useImportActions } from './useEmployeeImport/useImportActions';
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
  } = useImportState();

  // Fetch branches and existing employees
  useImportData(businessId, setBranches, setExistingEmployees);

  // Import actions
  const actions = useImportActions({
    businessId,
    rawData,
    branches,
    existingEmployees,
    previewData,
    setStep,
    setFile,
    setRawData,
    setHeaders,
    setFieldMappings,
    setPreviewData,
    setIsImporting,
    setShowMappingDialog,
    setImportResult,
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
    
    // Constants
    systemFields,
    employeeTypes,
    
    // Actions
    ...actions,
    
    // Sample data for mapping dialog
    sampleData: rawData.slice(0, 5)
  };
};
