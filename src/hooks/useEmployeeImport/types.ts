

// Import step types
export type ImportStep = 'closed' | 'upload' | 'mapping' | 'preview' | 'importing' | 'results' | 'summary';

// Excel data types
export type ExcelRow = any[];

// Field mapping types
export interface FieldMapping {
  id: string;
  systemField: string;
  mappedColumns: string[];
  isRequired: boolean;
  label: string;
  isCustomField?: boolean;
  customFieldName?: string;
}

// Preview employee type
export interface PreviewEmployee {
  business_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  id_number?: string;
  employee_id?: string;
  address?: string;
  employee_type?: string;
  weekly_hours?: number;
  main_branch_name?: string;
  isValid: boolean;
  isDuplicate: boolean;
  validationErrors: string[];
}

// Import result types
export interface ImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  message: string;
  errors: Array<{
    row: number;
    employee: string;
    error: string;
  }>;
  importedEmployees: Array<{
    name: string;
    email?: string;
    branch?: string;
  }>;
}

// Hook return type
export interface EmployeeImportHook {
  step: ImportStep;
  setStep: (step: ImportStep) => void;
  file: File | null;
  rawData: ExcelRow[];
  setRawData: (data: ExcelRow[]) => void;
  headers: string[];
  setHeaders: (headers: string[]) => void;
  fieldMappings: FieldMapping[];
  setFieldMappings: (mappings: FieldMapping[]) => void;
  previewData: PreviewEmployee[];
  setPreviewData: (data: PreviewEmployee[]) => void;
  importResult: ImportResult;
  setImportResult: (result: ImportResult) => void;
  showMappingDialog: boolean;
  setShowMappingDialog: (show: boolean) => void;
  processFile: (file: File) => Promise<void>;
  executeImport: () => Promise<void>;
  confirmMapping: (mappings: FieldMapping[]) => Promise<void>;
  resetForm: () => void;
  downloadTemplate: () => void;
  branches: Array<{ id: string; name: string }>;
  existingEmployees: Array<{ email?: string; id_number?: string; employee_id?: string }>;
  businessId: string | null | undefined;
}

