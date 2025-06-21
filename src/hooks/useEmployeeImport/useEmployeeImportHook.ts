
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useSecureBusinessData } from '@/hooks/useSecureBusinessData';
import { useImportState } from './hooks/useImportState';
import { useFileProcessing } from './hooks/useFileProcessing';
import { useFieldMapping } from './hooks/useFieldMapping';
import { useImportExecution } from './hooks/useImportExecution';
import type { ImportStep } from './types';

export const useEmployeeImport = (selectedBusinessId?: string | null) => {
  const { businessId: contextBusinessId } = useCurrentBusiness();
  
  // Use selectedBusinessId if provided, otherwise fall back to context business ID
  const effectiveBusinessId = selectedBusinessId || contextBusinessId;

  console.log('🔄 useEmployeeImport - businessId logic:', {
    selectedBusinessId,
    contextBusinessId,
    effectiveBusinessId
  });

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
    queryKey: ['branches', effectiveBusinessId],
    tableName: 'branches',
    enabled: !!effectiveBusinessId
  });

  const { data: existingEmployees = [] } = useSecureBusinessData({
    queryKey: ['employees', effectiveBusinessId],
    tableName: 'employees',
    enabled: !!effectiveBusinessId
  });

  // File processing
  const { processFile, downloadTemplate } = useFileProcessing({
    businessId: effectiveBusinessId,
    setFile,
    setRawData,
    setHeaders,
    setStep,
    setShowMappingDialog,
  });

  // Field mapping
  const { confirmMapping } = useFieldMapping({
    businessId: effectiveBusinessId,
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
    businessId: effectiveBusinessId,
    previewData,
    setStep,
    setImportResult,
  });

  return {
    // State
    step,
    setStep: (step: ImportStep) => setStep(step),
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
    businessId: effectiveBusinessId,
  };
};
