
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
}

export interface EmployeeFile {
  id: string;
  employee_id: string;
  business_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  employee: Employee;
}

export interface SignedDocument {
  id: string;
  employee_id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  signed_at: string;
  created_at: string;
  digital_signature_data?: any;
  employee: Employee;
}

export interface GroupedFiles {
  employee: Employee;
  files: EmployeeFile[];
  signedDocuments: SignedDocument[];
}

export interface FiltersState {
  searchTerm: string;
  dateFilter: string;
  fileTypeFilter: string;
}
