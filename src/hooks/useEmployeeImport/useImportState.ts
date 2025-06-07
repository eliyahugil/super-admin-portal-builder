
import { useState } from 'react';
import type { ImportState, ImportStep } from './types';
import { initialImportResult } from './constants';
import type { ExcelRow, PreviewEmployee, ImportResult } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

export const useImportState = (): ImportState & {
  setStep: (step: ImportStep) => void;
  setFile: (file: File | null) => void;
  setRawData: (data: ExcelRow[]) => void;
  setHeaders: (headers: string[]) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setPreviewData: (data: PreviewEmployee[]) => void;
  setBranches: (branches: any[]) => void;
  setExistingEmployees: (employees: any[]) => void;
  setIsImporting: (importing: boolean) => void;
  setShowMappingDialog: (show: boolean) => void;
  setImportResult: (result: ImportResult) => void;
} => {
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
  };
};
