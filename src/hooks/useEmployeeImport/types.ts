
export interface ExcelRow {
  [key: string]: any;
}

export type ImportStep = 'upload' | 'mapping' | 'validation' | 'importing' | 'complete';

export interface EmployeeImportHook {
  // State
  step: ImportStep;
  file: File | null;
  rawData: ExcelRow[];
  headers: string[];
  showMappingDialog: boolean;
  sampleData: ExcelRow[];
  systemFields: Array<{ value: string; label: string }>;
  
  // Actions
  handleFileUpload: (file: File) => Promise<void>;
  handleMappingConfirm: (mappings: any) => void;
  resetForm: () => void;
  setShowMappingDialog: (show: boolean) => void;
}
