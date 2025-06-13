
import { useState } from 'react';
import type { ExcelRow, PreviewEmployee, ImportResult, FieldMapping } from './types';
import type { ImportStep } from './types';

interface ValidationError {
  rowIndex: number;
  field: string;
  error: string;
  severity: 'error' | 'warning';
}

interface DuplicateError {
  rowIndex: number;
  duplicateField: string;
  existingValue: string;
  severity: 'error' | 'warning';
}

const initialImportResult: ImportResult = {
  success: false,
  importedCount: 0,
  errorCount: 0,
  message: '',
  errors: [],
  importedEmployees: []
};

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
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [duplicateErrors, setDuplicateErrors] = useState<DuplicateError[]>([]);

  return {
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
    branches,
    setBranches,
    existingEmployees,
    setExistingEmployees,
    isImporting,
    setIsImporting,
    showMappingDialog,
    setShowMappingDialog,
    importResult,
    setImportResult,
    validationErrors,
    setValidationErrors,
    duplicateErrors,
    setDuplicateErrors,
  };
};
