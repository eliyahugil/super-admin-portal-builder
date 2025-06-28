
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useFileProcessing } from './hooks/useFileProcessing';
import { useFieldMapping } from './hooks/useFieldMapping';
import { useImportExecution } from './hooks/useImportExecution';
import { useBranches } from '@/hooks/useBranches';
import { useExistingEmployees } from '@/hooks/useExistingEmployees';
import type { 
  FieldMapping, 
  PreviewEmployee, 
  ImportResult, 
  ImportStep,
  EmployeeImportHook 
} from './types';

export const useEmployeeImportHook = (selectedBusinessId?: string | null): EmployeeImportHook => {
  // State management
  const [step, setStep] = useState<ImportStep>('closed');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [previewData, setPreviewData] = useState<PreviewEmployee[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  
  const { toast } = useToast();
  const { businessId: contextBusinessId } = useCurrentBusiness();
  
  // Determine effective business ID
  const effectiveBusinessId = selectedBusinessId || contextBusinessId;

  console.log('🏢 useEmployeeImportHook - Business ID logic:', {
    selectedBusinessId,
    contextBusinessId,
    effectiveBusinessId,
    step,
    stateData: {
      fileSelected: !!file,
      headersCount: headers.length,
      rawDataCount: rawData.length,
      fieldMappingsCount: fieldMappings.length,
      previewDataCount: previewData.length,
      showMappingDialog,
      importResultExists: !!importResult
    }
  });

  // Data hooks - Get full employee data for comparison
  const { data: branches = [] } = useBranches(effectiveBusinessId);
  const { data: existingEmployees = [] } = useExistingEmployees(effectiveBusinessId);

  console.log('📊 useEmployeeImportHook - Data hooks:', {
    branchesCount: branches.length,
    existingEmployeesCount: existingEmployees.length
  });

  // Custom hooks for different phases
  const { processFile, downloadTemplate, isProcessing } = useFileProcessing({
    businessId: effectiveBusinessId,
    setFile,
    setRawData,
    setHeaders,
    setStep,
    setShowMappingDialog,
  });

  const { confirmMapping } = useFieldMapping({
    businessId: effectiveBusinessId,
    rawData,
    branches,
    existingEmployees,
    setFieldMappings,
    setPreviewData,
    setStep,
    setShowMappingDialog,
    headers,
  });

  const { executeImport: executeImportInternal } = useImportExecution({
    businessId: effectiveBusinessId,
    previewData,
    setStep,
    setImportResult,
  });

  // Wrap executeImport to match the expected Promise<void> signature
  const executeImport = useCallback(async (): Promise<void> => {
    console.log('🚀 useEmployeeImportHook - executeImport called');
    console.log('📊 Current preview data for import:', {
      count: previewData.length,
      validCount: previewData.filter(emp => emp.isValid).length,
      sampleData: previewData.slice(0, 2).map(emp => ({
        first_name: emp.first_name,
        last_name: emp.last_name,
        business_id: emp.business_id,
        isValid: emp.isValid
      }))
    });
    
    try {
      await executeImportInternal();
      console.log('✅ useEmployeeImportHook - executeImport completed successfully');
    } catch (error) {
      console.error('💥 useEmployeeImportHook - executeImport failed:', error);
      throw error;
    }
  }, [executeImportInternal, previewData]);

  const resetForm = useCallback(() => {
    console.log('🔄 useEmployeeImportHook - Resetting import form');
    setStep('closed');
    setFile(null);
    setHeaders([]);
    setRawData([]);
    setFieldMappings([]);
    setPreviewData([]);
    setImportResult(null);
    setShowMappingDialog(false);
  }, []);

  return {
    step,
    setStep,
    file,
    headers,
    rawData,
    fieldMappings,
    previewData,
    importResult,
    showMappingDialog,
    setShowMappingDialog,
    businessId: effectiveBusinessId,
    processFile,
    confirmMapping,
    executeImport,
    resetForm,
    downloadTemplate,
  };
};
