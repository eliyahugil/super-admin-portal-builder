
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
  
  // Determine effective business ID with better fallback handling
  const effectiveBusinessId = selectedBusinessId || contextBusinessId;

  console.log('🏢 useEmployeeImportHook - Business ID consistency check:', {
    selectedBusinessId,
    contextBusinessId,
    effectiveBusinessId,
    isEffectiveIdValid: !!effectiveBusinessId,
    step,
    fileExists: !!file
  });

  // Only proceed with data fetching if we have a valid business ID
  const shouldFetchData = !!effectiveBusinessId;

  // Data hooks - only fetch when we have valid business ID
  const { data: branches = [], isLoading: branchesLoading } = useBranches(effectiveBusinessId, {
    enabled: shouldFetchData
  });
  
  const { data: existingEmployees = [], isLoading: employeesLoading } = useExistingEmployees(effectiveBusinessId, {
    enabled: shouldFetchData
  });

  console.log('📊 useEmployeeImportHook - Data status:', {
    businessId: effectiveBusinessId,
    shouldFetchData,
    branchesCount: branches.length,
    branchesLoading,
    existingEmployeesCount: existingEmployees.length,
    employeesLoading
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

  // Enhanced executeImport with business ID validation
  const executeImport = useCallback(async (): Promise<void> => {
    console.log('🚀 useEmployeeImportHook - executeImport validation:', {
      effectiveBusinessId,
      previewDataCount: previewData.length,
      validPreviewCount: previewData.filter(emp => emp.isValid).length
    });

    if (!effectiveBusinessId) {
      console.error('❌ No business ID available for import execution');
      toast({
        title: "שגיאה",
        description: "לא נבחר עסק לייבוא. אנא בחר עסק ונסה שוב.",
        variant: "destructive"
      });
      return;
    }

    if (previewData.length === 0) {
      console.error('❌ No preview data available for import');
      toast({
        title: "שגיאה", 
        description: "אין נתוני תצוגה מקדימה לייבוא",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await executeImportInternal();
      console.log('✅ useEmployeeImportHook - executeImport completed successfully');
    } catch (error) {
      console.error('💥 useEmployeeImportHook - executeImport failed:', error);
      toast({
        title: "שגיאה בייבוא",
        description: error instanceof Error ? error.message : "שגיאה לא צפויה",
        variant: "destructive"
      });
      throw error;
    }
  }, [executeImportInternal, previewData, effectiveBusinessId, toast]);

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

  // Enhanced validation before returning hook data
  const hookData = {
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
    processFile: effectiveBusinessId ? processFile : () => {
      toast({
        title: "שגיאה",
        description: "אנא בחר עסק לפני ביצוע ייבוא",
        variant: "destructive"
      });
    },
    confirmMapping: effectiveBusinessId ? confirmMapping : async () => {
      toast({
        title: "שגיאה", 
        description: "אנא בחר עסק לפני ביצוע מיפוי",
        variant: "destructive"
      });
    },
    executeImport,
    resetForm,
    downloadTemplate,
  };

  console.log('📤 useEmployeeImportHook - Returning hook data:', {
    step: hookData.step,
    businessId: hookData.businessId,
    hasValidBusinessId: !!hookData.businessId,
    fileExists: !!hookData.file,
    previewCount: hookData.previewData.length
  });

  return hookData;
};
