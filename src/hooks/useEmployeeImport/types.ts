
import type { ExcelRow, PreviewEmployee, ImportResult } from '@/services/ExcelImportService';
import type { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

export interface ExcelRow {
  [key: string]: any;
}

export type ImportStep = 'upload' | 'mapping' | 'validation' | 'importing' | 'complete' | 'preview' | 'summary';

export interface ImportValidation {
  runValidation: () => void;
  validateImportData: () => boolean;
  getValidationSummary: () => {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
  };
}

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

export interface EmployeeImportHook {
  // State
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
  sampleData: ExcelRow[];
  
  // Constants
  systemFields: Array<{ value: string; label: string }>;
  employeeTypes: Array<{ value: string; label: string }>;
  
  // Actions
  handleFileUpload: (file: File) => Promise<void>;
  handleMappingConfirm: (mappings: FieldMapping[]) => Promise<void>;
  resetForm: () => void;
  downloadTemplate: () => void;
  handleImport: () => Promise<void>;
  setShowMappingDialog: (show: boolean) => void;
  
  // Validation methods
  runValidation: () => void;
  validateImportData: () => boolean;
  getValidationSummary: () => {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
  };
}
