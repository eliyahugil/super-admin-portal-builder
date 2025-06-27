
export interface ShiftData {
  id: string;
  employee_id: string;
  employee_name: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  branch_name?: string;
  branch_preference?: string;
  role_preference?: string;
  notes?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export type ShiftSortBy = 'employee_name' | 'shift_date' | 'status' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export interface ShiftFilters {
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
  branchFilter: string;
}
