
import { useBusiness } from '@/hooks/useBusiness';
import { useSecureBusinessData } from '@/hooks/useSecureBusinessData';
import { useImportState } from './hooks/useImportState';
import { useFileProcessing } from './hooks/useFileProcessing';
import { useFieldMapping } from './hooks/useFieldMapping';
import { useImportExecution } from './hooks/useImportExecution';

export const useEmployeeImport = () => {
  const { businessId } = useBusiness();

  // State management
  const {
    step,
    setStep,
    file,
    setFile,
    rawData,
    setRawData,
    headers,
    setHeaders,
    fieldMappings,
    setFieldMappings,
    previewData,
    setPreviewData,
    importResult,
    setImportResult,
    showMappingDialog,
    setShowMappingDialog,
    resetForm,
  } = useImportState();

  // Data dependencies
  const { data: branches = [] } = useSecureBusinessData({
    queryKey: ['branches'],
    tableName: 'branches',
    enabled: !!businessId
  });

  const { data: existingEmployees = [] } = useSecureBusinessData({
    queryKey: ['employees'],
    tableName: 'employees',
    enabled: !!businessId
  });

  // File processing
  const { processFile, downloadTemplate } = useFileProcessing({
    businessId,
    setFile,
    setRawData,
    setHeaders,
    setStep,
    setShowMappingDialog,
  });

  // Field mapping
  const { confirmMapping } = useFieldMapping({
    businessId,
    rawData,
    branches,
    existingEmployees,
    setFieldMappings,
    setPreviewData,
    setStep,
    setShowMappingDialog,
  });

  // Import execution
  const { executeImport } = useImportExecution({
    businessId,
    previewData,
    setStep,
    setImportResult,
  });

  return {
    // State
    step,
    setStep,
    file,
    rawData,
    setRawData,
    headers,
    setHeaders,
    fieldMappings,
    setFieldMappings,
    previewData,
    setPreviewData,
    importResult,
    setImportResult,
    showMappingDialog,
    setShowMappingDialog,

    // Handlers
    processFile,
    executeImport,
    confirmMapping,

    // Utilities
    resetForm,
    downloadTemplate,

    // Dependencies
    branches,
    existingEmployees,
    businessId,
  };
};
