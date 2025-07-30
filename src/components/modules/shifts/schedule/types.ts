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
  is_archived?: boolean;
  weekly_hours_required?: number;
  birth_date?: string | null;
  employee_type?: string;
  // Additional fields from Supabase employees table
  id_number?: string;
  address?: string;
  hire_date?: string;
  main_branch_id?: string;
  notes?: string;
}

export interface Branch {
  id: string;
  name: string;
  business_id: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  gps_radius?: number;
  is_active?: boolean;
}

export interface ShiftAssignment {
  id: string;
  type: 'חובה' | 'תגבור';
  employee_id: string | null;
  position: number;
  is_required: boolean;
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
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'assigned';
  shift_template_id?: string | null;
  is_assigned: boolean;
  is_archived: boolean;
  required_employees?: number;
  priority?: 'critical' | 'normal' | 'backup';
  shift_assignments?: ShiftAssignment[];
  created_at: string;
  updated_at: string;
  branch_name?: string;
  role_preference?: string;
  is_new?: boolean;
}

export type ScheduleView = 'week' | 'month' | 'year' | 'grouped';

export type CreateShiftData = Pick<ShiftScheduleData, 'shift_date' | 'start_time' | 'end_time' | 'employee_id' | 'branch_id' | 'role' | 'notes' | 'status' | 'shift_template_id' | 'required_employees' | 'priority' | 'shift_assignments'>;

export interface ScheduleFiltersType {
  status: 'all' | 'pending' | 'approved' | 'rejected' | 'completed' | 'assigned';
  employee: 'all' | string;
  branch: 'all' | string;
  role: 'all' | string;
  date?: string; // Add date filter support
}

// Import types from central location for proper typing
import type { IsraeliHoliday, ShabbatTimes, CalendarEvent } from '@/types/calendar';

// Backward compatibility alias
export type Holiday = IsraeliHoliday;

// Enhanced PendingSubmission interface - removed token field as it doesn't exist in database
export interface PendingSubmission {
  id: string;
  employee_id: string;
  submission_type: string;
  status: string;
  submitted_at: string;
  // Database fields - no token field exists
  shifts: any; // JSON from database - required
  week_start_date: string; // Required
  week_end_date: string; // Required
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Make employees required to match ShiftSubmission
  employees: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    business_id: string;
    phone?: string;
    employee_type?: string;
    weekly_hours_required?: number;
  };
}

export interface ShiftScheduleViewProps {
  shifts: ShiftScheduleData[];
  employees: Employee[];
  branches: Branch[];
  currentDate: Date;
  holidays: IsraeliHoliday[];
  shabbatTimes: ShabbatTimes[];
  calendarEvents: CalendarEvent[];
  pendingSubmissions?: PendingSubmission[];
  businessId?: string | null;
  todaysBirthdays?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    birth_date: string;
  }>;
  
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => Promise<void>;
  onAddShift: (date: Date) => void;
  onShiftDelete?: (shiftId: string) => Promise<void>;
  // Bulk edit props
  isSelectionMode?: boolean;
  selectedShifts?: ShiftScheduleData[];
  onShiftSelection?: (shift: ShiftScheduleData, selected: boolean, event?: React.MouseEvent) => void;
  // Pending submissions dialog
  onShowPendingSubmissions?: () => void;
  
  // Filter props - הוספת הפרופס החסרים
  filters?: ScheduleFiltersType;
  onFiltersChange?: (filters: Partial<ScheduleFiltersType>) => void;
  onQuickFilter?: (type: 'today' | 'tomorrow' | 'this_week' | 'next_week') => void;
  onResetFilters?: () => void;
}

// Employee preferences types
export interface EmployeeShiftPreference {
  id: string;
  employee_id: string;
  business_id: string;
  preference_type: 'shift_type' | 'day_preference' | 'time_preference' | 'branch_preference';
  preference_value: any; // JSONB field - flexible storage
  priority_score: number; // 1-10 scale
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}
