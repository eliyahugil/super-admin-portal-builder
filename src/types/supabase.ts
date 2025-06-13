
// ===========================
// 🌐 כל הטיפוסים של המערכת
// ===========================

export interface Business {
  id: string;
  name: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface Employee {
  id: string;
  business_id: string;
  employee_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  employee_type: 'permanent' | 'temporary' | 'youth' | 'contractor';
  hire_date?: string;
  termination_date?: string;
  is_active?: boolean;
  main_branch_id?: string;
  preferred_shift_type?: 'morning' | 'afternoon' | 'evening' | 'night' | 'full_day';
  weekly_hours_required?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  
  // Extended properties from joins
  main_branch?: { name: string } | null;
  employee_notes?: Array<{
    id: string;
    content: string;
    note_type: string;
    created_at: string;
  }>;
  employee_documents?: Array<{
    id: string;
    document_name: string;
    document_type: string;
    file_url: string;
    created_at: string;
  }>;
  branch_assignments?: Array<{
    id: string;
    branch: { name: string };
    role_name: string;
    is_active: boolean;
  }>;
  weekly_tokens?: Array<{
    id: string;
    token: string;
    week_start_date: string;
    week_end_date: string;
    is_active: boolean;
  }>;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  route?: string;
  is_custom: boolean;
  is_active: boolean;
  customer_number?: number;
  module_config?: any;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  business_id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  gps_radius?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  digital_signature_data?: any;
  uploaded_by: string;
  created_at?: string;
  employee?: Employee;
}

export interface EmployeeBranchPriority {
  id: string;
  employee_id: string;
  branch_id: string;
  priority_order: number;
  weekly_hours_limit?: number;
  created_at?: string;
  employee?: Employee;
  branch?: Branch;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'super_admin' | 'business_admin' | 'business_user';
  created_at: string;
  updated_at: string;
}

export interface EmployeeRequest {
  id: string;
  employee_id: string;
  subject: string;
  description?: string;
  request_type: 'vacation' | 'equipment' | 'shift_change';
  request_data?: any;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at?: string;
  employee?: Employee;
}

export type RequestType = 'vacation' | 'shift_change' | 'equipment' | 'other';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type AttendanceAction = 'check_in' | 'check_out';
export type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night' | 'full_day';
export type EmployeeType = 'permanent' | 'temporary' | 'youth' | 'contractor';
export type UserRole = 'super_admin' | 'business_admin' | 'business_user';
