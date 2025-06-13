
import { useState } from 'react';
import type { 
  ImportStep, 
  ExcelRow, 
  PreviewEmployee, 
  ImportResult,
  FieldMapping 
} from '../types';

export const useImportState = () => {
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
  const [showMappingDialog, setShowMappingDialog] = useState(false);

  const resetForm = () => {
    console.log('🔄 Resetting import form');
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setFieldMappings([]);
    setPreviewData([]);
    setImportResult({
      success: false,
      importedCount: 0,
      errorCount: 0,
      message: '',
      errors: [],
      importedEmployees: []
    });
    setShowMappingDialog(false);
  };

  return {
    // State
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

    // Actions
    resetForm,
  };
};
