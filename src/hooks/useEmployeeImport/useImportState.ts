
import { useState } from 'react';
import type { ImportStep } from './types';
import type { ExcelRow, PreviewEmployee, ImportResult } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';
import { initialImportResult } from './constants';

export const useImportState = () => {
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

  return {
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
    setValidationErrors,
    setDuplicateErrors,
  };
};
