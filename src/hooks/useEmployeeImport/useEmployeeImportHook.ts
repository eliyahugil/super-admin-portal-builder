
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { useSecureBusinessData } from '@/hooks/useSecureBusinessData';
import { useImportForm } from './useImportForm';
import { useFileProcessing } from './useFileProcessing';
import { useFieldMapping } from './useFieldMapping';
import { useImportExecution } from './useImportExecution';
import type { 
  ImportStep, 
  ExcelRow, 
  PreviewEmployee, 
  ImportResult,
  FieldMapping 
} from './types';

export const useEmployeeImport = () => {
  const { toast } = useToast();
  const { businessId } = useBusiness();

  // State management
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [previewData, setPreviewData] = useState<PreviewEmployee[]>([]);
  const [importResult, setImportResult] = useState<ImportResult>({
    success: false,
    importedCount: 0,
    errorCount: 0,
    message: '',
    errors: [],
    importedEmployees: []
  });
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [duplicateErrors, setDuplicateErrors] = useState<any[]>([]);
  const [showMappingDialog, setShowMappingDialog] = useState(false);

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

  // Hook compositions
  const importForm = useImportForm({
    setStep,
    setFile,
    setRawData,
    setHeaders,
    setFieldMappings,
    setPreviewData,
    setImportResult,
    setValidationErrors,
    setDuplicateErrors,
    setShowMappingDialog,
  });

  const fileProcessing = useFileProcessing({
    businessId,
    setStep,
    setRawData,
    setHeaders,
    setShowMappingDialog,
  });

  const fieldMapping = useFieldMapping({
    businessId,
    rawData,
    branches,
    existingEmployees,
    setFieldMappings,
    setPreviewData,
    setStep,
    setShowMappingDialog,
  });

  const importExecution = useImportExecution({
    businessId,
    previewData,
    setStep,
    setImportResult,
  });

  // Main handlers
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    console.log('🎯 File selected:', selectedFile.name);
    setFile(selectedFile);
    await fileProcessing.processFile(selectedFile);
  }, [fileProcessing]);

  const handleConfirmImport = useCallback(async () => {
    console.log('🚀 Starting import with preview data:', previewData.length);
    await importExecution.executeImport();
  }, [importExecution, previewData]);

  return {
    // State
    step,
    file,
    rawData,
    headers,
    fieldMappings,
    previewData,
    importResult,
    validationErrors,
    duplicateErrors,
    showMappingDialog,
    setShowMappingDialog,

    // Handlers
    handleFileSelect,
    handleConfirmImport,
    confirmMapping: fieldMapping.confirmMapping,

    // Utilities
    resetForm: importForm.resetForm,
    downloadTemplate: importForm.downloadTemplate,

    // Dependencies
    branches,
    existingEmployees,
    businessId,
  };
};
