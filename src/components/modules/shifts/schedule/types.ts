
export type ScheduleView = 'week' | 'month';

export interface ShiftScheduleData {
  id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  branch_id?: string;
  branch_name?: string;
  role_preference?: string;
  notes?: string;
  created_at: string;
}

export interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  employee_id?: string;
}

export interface BranchData {
  id: string;
  name: string;
  address?: string;
}

export interface ScheduleFilters {
  status: 'all' | 'pending' | 'approved' | 'rejected' | 'completed';
  employee: 'all' | string;
  branch: 'all' | string;
  role: 'all' | string;
}
