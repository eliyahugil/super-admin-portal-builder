
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useFileUpload } from './actions/useFileUpload';
import { useImportProcess } from './actions/useImportProcess';
import { useImportUtils } from './actions/useImportUtils';
import { useImportData } from './useImportData';
import { useImportValidation } from './useImportValidation';
import { ExcelImportService } from '@/services/ExcelImportService';
import { systemFields, employeeTypes, initialImportResult } from './constants';
import type { ImportState, ImportStep, EmployeeImportHook } from './types';
import type { ExcelRow, PreviewEmployee, ImportResult } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

export function useEmployeeImport(): EmployeeImportHook {
  const businessId = useBusinessId();
  const { toast } = useToast();

  // State management
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [previewData, setPreviewData] = useState<PreviewEmployee[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [existingEmployees, setExistingEmployees] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult>(initialImportResult);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [duplicateErrors, setDuplicateErrors] = useState<any[]>([]);

  // Initialize data fetching
  useImportData(businessId, setBranches, setExistingEmployees);

  // Initialize validation
  const validation = useImportValidation(previewData, setValidationErrors, setDuplicateErrors);

  // Initialize utility functions
  const { resetForm, downloadTemplate } = useImportUtils({
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

  // Initialize file upload
  const { handleFileUpload } = useFileUpload({
    setFile,
    setRawData,
    setHeaders,
    setStep,
    setShowMappingDialog,
  });

  // Initialize import process
  const { handleImport } = useImportProcess({
    previewData,
    validation,
    setIsImporting,
    setImportResult,
    setStep,
  });

  // Handle mapping confirmation and generate preview
  const handleMappingConfirm = useCallback(async (mappings: FieldMapping[]) => {
    try {
      console.log('🎯 Starting mapping confirmation with mappings:', mappings.length);
      
      if (!businessId) {
        toast({
          title: 'שגיאה',
          description: 'לא נמצא מזהה עסק',
          variant: 'destructive'
        });
        return;
      }

      setFieldMappings(mappings);
      setShowMappingDialog(false);

      // Show processing message
      toast({
        title: 'מעבד נתונים...',
        description: 'יוצר תצוגה מקדימה של הנתונים',
      });

      console.log('📊 Generating preview data with:', {
        rawDataRows: rawData.length,
        mappingsCount: mappings.length,
        businessId,
        branchesCount: branches.length,
        existingEmployeesCount: existingEmployees.length
      });

      // Generate preview data
      const preview = ExcelImportService.generatePreview(
        rawData,
        mappings,
        businessId,
        branches,
        existingEmployees,
        employeeTypes
      );

      console.log('✅ Preview generated successfully:', {
        totalRows: preview.length,
        validRows: preview.filter(p => p.isValid).length,
        errorRows: preview.filter(p => !p.isValid).length
      });

      setPreviewData(preview);

      // Run validation
      validation.runValidation();

      // Move to preview step
      setStep('preview');

      toast({
        title: 'תצוגה מקדימה מוכנה! 📊',
        description: `נמצאו ${preview.length} עובדים לעיון ואישור`,
      });

    } catch (error) {
      console.error('💥 Error in mapping confirmation:', error);
      toast({
        title: 'שגיאה במיפוי שדות',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive'
      });
    }
  }, [rawData, businessId, branches, existingEmployees, toast, validation]);

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

    // Actions
    handleFileUpload,
    handleMappingConfirm,
    handleImport,
    resetForm,
    downloadTemplate,
    setShowMappingDialog,

    // Validation
    validateImportData: validation.validateImportData,
    getValidationSummary: validation.getValidationSummary,

    // Constants
    systemFields,
    employeeTypes,
    sampleData: rawData.slice(0, 3), // Show first 3 rows as sample
  };
}

export type { ImportStep } from './types';
