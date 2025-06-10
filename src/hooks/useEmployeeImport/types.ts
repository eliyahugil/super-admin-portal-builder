
import type { ExcelRow, PreviewEmployee, ImportResult } from '@/services/ExcelImportService';
import type { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'summary';

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
  validationErrors: any[];
  duplicateErrors: any[];
  
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
  
  // Sample data for mapping dialog
  sampleData: ExcelRow[];
}
