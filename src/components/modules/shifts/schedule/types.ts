
import type { IsraeliHoliday } from '@/hooks/useIsraeliHolidays';

export type ScheduleView = 'week' | 'month';

export interface ShiftScheduleData {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  employee_id: string;
  branch_id?: string;
  branch_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
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
}

export interface BranchData {
  id: string;
  name: string;
  address?: string;
  business_id: string; // ✅ הוספתי את business_id
}

export interface ShiftFilters {
  employeeId?: string;
  branchId?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ScheduleFilters {
  status: string;
  employee: string;
  branch: string;
  role: string;
}

export interface ShiftScheduleViewProps {
  shifts: ShiftScheduleData[];
  employees: EmployeeData[];
  currentDate: Date;
  holidays: IsraeliHoliday[];
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
}
