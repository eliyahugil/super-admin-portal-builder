
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

  console.log('🔄 useEmployeeImport - businessId logic:', {
    selectedBusinessId,
    contextBusinessId,
    effectiveBusinessId
  });

  // Data hooks - Fix the existing employees data structure to include required id field
  const { data: branches = [] } = useBranches(effectiveBusinessId);
  const { data: rawExistingEmployees = [] } = useExistingEmployees(effectiveBusinessId);
  
  // Transform existing employees data to match expected type with required id field
  const existingEmployees = rawExistingEmployees.map(emp => ({
    id: emp.id || '', // Ensure id field is always present
    email: emp.email || undefined,
    id_number: emp.id_number || undefined,
    employee_id: emp.employee_id || undefined,
    first_name: emp.first_name || undefined,
    last_name: emp.last_name || undefined,
    phone: emp.phone || undefined,
    address: emp.address || undefined,
    employee_type: emp.employee_type || undefined,
    hire_date: emp.hire_date || undefined,
    main_branch_id: emp.main_branch_id || undefined,
    notes: emp.notes || undefined,
    weekly_hours_required: emp.weekly_hours_required || undefined,
  }));

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
    headers, // Pass headers to the field mapping hook
  });

  const { executeImport: executeImportInternal } = useImportExecution({
    businessId: effectiveBusinessId,
    previewData,
    setStep,
    setImportResult,
  });

  // Wrap executeImport to match the expected Promise<void> signature
  const executeImport = useCallback(async (): Promise<void> => {
    await executeImportInternal();
  }, [executeImportInternal]);

  const resetForm = useCallback(() => {
    console.log('🔄 Resetting import form');
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
