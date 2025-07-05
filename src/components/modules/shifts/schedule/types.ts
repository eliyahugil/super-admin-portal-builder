
import type { IsraeliHoliday } from '@/hooks/useIsraeliHolidays';
import type { ShabbatTimes } from '@/hooks/useShabbatTimes';

export interface ShiftScheduleData {
  id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  branch_id: string;
  branch_name?: string;
  role_preference: string;
  notes: string;
  created_at: string;
}

export interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  business_id: string;
}

export interface BranchData {
  id: string;
  name: string;
  address?: string;
  business_id: string;
}

export interface ShiftScheduleFilters {
  employee_id: string;
  branch_id: string;
  status: string;
  date_from: string;
  date_to: string;
}

export type ScheduleView = 'week' | 'month';

export interface ShiftScheduleViewProps {
  shifts: ShiftScheduleData[];
  employees: EmployeeData[];
  currentDate: Date;
  holidays: IsraeliHoliday[];
  shabbatTimes?: ShabbatTimes[];
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
}
