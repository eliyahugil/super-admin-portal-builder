
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

  // Data hooks - fix the argument count by passing only the business ID
  const { data: branches = [], isLoading: branchesLoading } = useBranches(effectiveBusinessId);
  
  const { data: existingEmployees = [], isLoading: employeesLoading } = useExistingEmployees(effectiveBusinessId);

  console.log('📊 useEmployeeImportHook - Data status:', {
    businessId: effectiveBusinessId,
    shouldFetchData,
    branchesCount: branches.length,
    branchesLoading,
    existingEmployeesCount: existingEmployees.length,
    employeesLoading
  });

  // Custom hooks for different phases
  const { processFile: processFileInternal, downloadTemplate, isProcessing } = useFileProcessing({
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

  // Enhanced processFile with business ID validation - ensure consistent return type
  const processFile = useCallback(async (file: File): Promise<void> => {
    console.log('🚀 useEmployeeImportHook - processFile validation:', {
      effectiveBusinessId,
      fileName: file.name,
      fileSize: file.size
    });

    if (!effectiveBusinessId) {
      console.error('❌ No business ID available for file processing');
      toast({
        title: "שגיאה",
        description: "לא נבחר עסק לעיבוד הקובץ. אנא בחר עסק ונסה שוב.",
        variant: "destructive"
      });
      return;
    }

    try {
      await processFileInternal(file);
      console.log('✅ useEmployeeImportHook - processFile completed successfully');
    } catch (error) {
      console.error('💥 useEmployeeImportHook - processFile failed:', error);
      toast({
        title: "שגיאה בעיבוד הקובץ",
        description: error instanceof Error ? error.message : "שגיאה לא צפויה",
        variant: "destructive"
      });
      throw error;
    }
  }, [processFileInternal, effectiveBusinessId, toast]);

  // Enhanced confirmMapping with business ID validation
  const confirmMappingEnhanced = useCallback(async (mappings: FieldMapping[]): Promise<void> => {
    console.log('🚀 useEmployeeImportHook - confirmMapping validation:', {
      effectiveBusinessId,
      mappingsCount: mappings.length
    });

    if (!effectiveBusinessId) {
      console.error('❌ No business ID available for mapping confirmation');
      toast({
        title: "שגיאה",
        description: "לא נבחר עסק לביצוע מיפוי. אנא בחר עסק ונסה שוב.",
        variant: "destructive"
      });
      return;
    }

    try {
      await confirmMapping(mappings);
      console.log('✅ useEmployeeImportHook - confirmMapping completed successfully');
    } catch (error) {
      console.error('💥 useEmployeeImportHook - confirmMapping failed:', error);
      toast({
        title: "שגיאה במיפוי השדות",
        description: error instanceof Error ? error.message : "שגיאה לא צפויה",
        variant: "destructive"
      });
      throw error;
    }
  }, [confirmMapping, effectiveBusinessId, toast]);

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

  // Return hook data with consistent types
  const hookData: EmployeeImportHook = {
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
    confirmMapping: confirmMappingEnhanced,
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
