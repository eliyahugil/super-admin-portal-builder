export interface FieldMapping {
  id: string;
  systemField: string;
  mappedColumns: string[];
  isRequired: boolean;
  label: string;
  isCustomField?: boolean;
  customFieldName?: string;
  columnIndex?: number; // Add this to store the actual column index
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
  employee_type: 'permanent' | 'temporary' | 'contractor' | 'youth';
  weekly_hours_required?: number;
  main_branch_id?: string;
  notes?: string;
  customFields: Record<string, any>;
  isValid: boolean;
  isDuplicate: boolean;
  isPartialUpdate?: boolean; // New flag for partial updates
  existingEmployeeId?: string; // Store existing employee ID for updates
  validationErrors: string[];
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
  importedEmployees: Array<{
    name: string;
    email?: string;
    branch?: string;
  }>;
}

export interface ExcelRow {
  [key: string]: any;
}

export type ImportStep = 'closed' | 'upload' | 'mapping' | 'preview' | 'importing' | 'results';

export interface EmployeeImportHook {
  step: ImportStep;
  setStep: (step: ImportStep) => void;
  file: File | null;
  headers: string[];
  rawData: any[];
  fieldMappings: FieldMapping[];
  previewData: PreviewEmployee[];
  importResult: ImportResult | null;
  showMappingDialog: boolean;
  setShowMappingDialog: (show: boolean) => void;
  businessId: string | null;
  processFile: (file: File) => Promise<void>;
  confirmMapping: (mappings: FieldMapping[]) => Promise<void>;
  executeImport: () => Promise<void>;
  resetForm: () => void;
  downloadTemplate: () => void;
}
