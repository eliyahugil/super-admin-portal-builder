
export type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'results' | 'summary';

export interface ParsedExcelData {
  headers: string[];
  data: any[];
}

export interface PreviewEmployee {
  business_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  id_number?: string;
  employee_id?: string;
  address?: string;
  hire_date?: string;
  employee_type: string;
  weekly_hours_required?: number;
  main_branch_id?: string;
  main_branch_name?: string;
  notes?: string;
  isValid: boolean;
  isDuplicate: boolean;
  validationErrors: string[];
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  message: string;
  errors: Array<{ row: number; employee: string; error: string }>;
  importedEmployees: Array<{ name: string; email?: string; branch?: string }>;
}

export interface FieldMapping {
  id: string;
  systemField: string;
  mappedColumns: string[];
  isCustomField?: boolean;
  customFieldName?: string;
}

export interface EmployeeImportHook {
  // State
  step: ImportStep;
  setStep: (step: ImportStep) => void;
  file: File | null;
  rawData: any[];
  setRawData: (data: any[]) => void;
  headers: string[];
  setHeaders: (headers: string[]) => void;
  fieldMappings: FieldMapping[];
  setFieldMappings: (mappings: FieldMapping[]) => void;
  previewData: PreviewEmployee[];
  setPreviewData: (data: PreviewEmployee[]) => void;
  importResult: ImportResult | null;
  setImportResult: (result: ImportResult) => void;
  showMappingDialog: boolean;
  setShowMappingDialog: (show: boolean) => void;

  // Handlers
  processFile: (file: File) => Promise<void>;
  executeImport: () => Promise<void>;
  confirmMapping: (mappings: FieldMapping[]) => Promise<void>;

  // Utilities
  resetForm: () => void;
  downloadTemplate: () => void;

  // Dependencies
  branches: Array<{ id: string; name: string }>;
  existingEmployees: Array<{ email?: string; id_number?: string; employee_id?: string }>;
  businessId: string | null;
}
