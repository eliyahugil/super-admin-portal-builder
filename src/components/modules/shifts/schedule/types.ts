
// Re-export types from central location
export type { CalendarEvent, GoogleCalendarEvent, IsraeliHoliday, ShabbatTimes } from '@/types/calendar';

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  business_id: string;
  employee_id: string;
  is_active?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  business_id: string;
  address?: string;
  is_active?: boolean;
}

export interface ShiftScheduleData {
  id: string;
  business_id: string;
  shift_date: string;
  start_time?: string;
  end_time?: string;
  employee_id?: string | null;
  branch_id?: string | null;
  role?: string | null;
  notes?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  shift_template_id?: string | null;
  is_assigned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  branch_name?: string;
  role_preference?: string;
}

export type ScheduleView = 'week' | 'month' | 'year';

export type CreateShiftData = Pick<ShiftScheduleData, 'shift_date' | 'start_time' | 'end_time' | 'employee_id' | 'branch_id' | 'role' | 'notes' | 'status' | 'shift_template_id'>;

export interface ScheduleFiltersType {
  status: 'all' | 'pending' | 'approved' | 'rejected' | 'completed';
  employee: 'all' | string;
  branch: 'all' | string;
  role: 'all' | string;
}

// Import types from central location for proper typing
import type { IsraeliHoliday, ShabbatTimes, CalendarEvent } from '@/types/calendar';

// Backward compatibility alias
export type Holiday = IsraeliHoliday;

export interface ShiftScheduleViewProps {
  shifts: ShiftScheduleData[];
  employees: Employee[];
  currentDate: Date;
  holidays: IsraeliHoliday[];
  shabbatTimes: ShabbatTimes[];
  calendarEvents: CalendarEvent[];
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => Promise<void>;
}
