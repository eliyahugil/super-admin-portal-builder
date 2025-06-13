
export type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'results' | 'summary';

export interface ExcelRow {
  [key: string]: any;
}

export interface PreviewEmployee {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  id_number?: string;
  employee_id?: string;
  address?: string;
  hire_date?: string;
  employee_type: 'permanent' | 'temporary' | 'youth' | 'contractor';
  weekly_hours_required?: number;
  main_branch_id?: string;
  notes?: string;
  business_id: string;
  is_active: boolean;
  isValid: boolean;
  validationErrors?: string[];
  isDuplicate?: boolean;
}

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
  importedEmployees: PreviewEmployee[];
}

export interface FieldMapping {
  id: string;
  systemField: string;
  mappedColumns: string[];
  isCustomField: boolean;
  customFieldName?: string;
  customFieldType?: string;
}

export interface ImportValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EmployeeImportHook {
  // Import state
  step: ImportStep;
  setStep: (step: ImportStep) => void;
  showMappingDialog: boolean;
  setShowMappingDialog: (show: boolean) => void;
  
  // File processing
  rawData: ExcelRow[];
  setRawData: (data: ExcelRow[]) => void;
  headers: string[];
  setHeaders: (headers: string[]) => void;
  
  // Field mapping
  fieldMappings: FieldMapping[];
  setFieldMappings: (mappings: FieldMapping[]) => void;
  
  // Preview data
  previewData: PreviewEmployee[];
  setPreviewData: (data: PreviewEmployee[]) => void;
  
  // Import result
  importResult: ImportResult | null;
  setImportResult: (result: ImportResult) => void;
  
  // Functions
  processFile: (file: File) => Promise<void>;
  executeImport: () => Promise<void>;
  downloadTemplate: () => void;
  resetForm: () => void;
}
