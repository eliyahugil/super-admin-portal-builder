
export interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  phone?: string;
  business_id: string;
}

export interface ShiftSubmission {
  id: string;
  employee_id: string;
  token: string;
  submitted_at: string;
  shifts: any; // JSON from database
  week_start_date: string;
  week_end_date: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: EmployeeData;
}

export interface ShiftEntry {
  date: string;
  start_time: string;
  end_time: string;
  branch_preference: string;
  role_preference?: string;
  notes?: string;
}
