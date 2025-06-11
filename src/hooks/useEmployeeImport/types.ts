
export type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'results';

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
    message: string;
    data?: any;
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
