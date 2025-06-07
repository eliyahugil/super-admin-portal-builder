
import type { ExcelRow, PreviewEmployee, ImportResult } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'summary';

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
}

export interface ImportActions {
  handleFileUpload: (uploadedFile: File) => Promise<void>;
  handleMappingConfirm: (mappings: FieldMapping[]) => void;
  handleImport: () => Promise<void>;
  resetForm: () => void;
  downloadTemplate: () => void;
  setShowMappingDialog: (show: boolean) => void;
}

export interface EmployeeImportHook extends ImportState, ImportActions {
  systemFields: Array<{ value: string; label: string }>;
  employeeTypes: Array<{ value: string; label: string }>;
  sampleData: ExcelRow[];
}
