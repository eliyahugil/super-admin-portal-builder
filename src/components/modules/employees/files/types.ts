
export interface EmployeeFile {
  id: string;
  employee_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  employee: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

export interface GroupedFiles {
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
  };
  files: EmployeeFile[];
}

export interface FiltersState {
  searchTerm: string;
  dateFilter: string;
  fileTypeFilter: string;
}
