
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

// Use the unified Employee type from employee.ts instead of defining it here
export type { Employee, EmployeeType } from '@/types/employee';

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
export type UserRole = 'super_admin' | 'business_admin' | 'business_user';

export interface ScheduledShift {
  id: string;
  shift_template_id: string;
  shift_date: string;
  branch_id: string | null;
  is_assigned: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  employee_id?: string | null;
  is_archived: boolean;
}
