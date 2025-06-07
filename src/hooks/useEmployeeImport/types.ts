
import type { ExcelRow, PreviewEmployee, ImportResult } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'summary';

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

export interface ImportState {
  step: ImportStep;
  file: File | null;
  rawData: ExcelRow[];
  headers: string[];
  fieldMappings: FieldMapping[];
  previewData: PreviewEmployee[];
  branches: any[];
  existingEmployees: any[];
  isImporting: boolean;
  showMappingDialog: boolean;
  importResult: ImportResult;
  validationErrors: ValidationError[];
  duplicateErrors: DuplicateError[];
}

export interface ImportActions {
  handleFileUpload: (uploadedFile: File) => Promise<void>;
  handleMappingConfirm: (mappings: FieldMapping[]) => void;
  handleImport: () => Promise<void>;
  resetForm: () => void;
  downloadTemplate: () => void;
  setShowMappingDialog: (show: boolean) => void;
}

export interface ImportValidation {
  validateImportData: () => boolean;
  getValidationSummary: () => {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
  };
}

export interface EmployeeImportHook extends ImportState, ImportActions, ImportValidation {
  systemFields: Array<{ value: string; label: string }>;
  employeeTypes: Array<{ value: string; label: string }>;
  sampleData: ExcelRow[];
}
