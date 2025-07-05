
import { GoogleCalendarEvent } from '@/hooks/useGoogleCalendar';
import { IsraeliHoliday } from '@/hooks/useIsraeliHolidaysFromHebcal';
import { ShabbatTimes } from '@/hooks/useShabbatTimesFromHebcal';

export type ScheduleView = 'week' | 'month' | 'year';

export interface ShiftScheduleData {
  id: string;
  employee_id?: string;
  branch_id?: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  role?: string;
  notes?: string;
  status?: string;
  created_at: string;
  // נוספו השדות החסרים:
  branch_name?: string;
  role_preference?: string;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id?: string;
  business_id: string;
  is_active: boolean;
  phone?: string;
  email?: string;
}

export interface Branch {
  id: string;
  name: string;
  business_id: string;
  address?: string;
  is_active: boolean;
}

// הוספת טיפוסים חסרים:
export type EmployeeData = Employee;
export type BranchData = Branch;

// Consolidated filter interface - using only one definition
export interface ShiftScheduleFilters {
  status: string;
  employee: string;
  branch: string;
  role: string;
}

// Combined calendar event type for unified handling
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  start_time?: string;
  end_time?: string;
  type: 'shift' | 'holiday' | 'shabbat' | 'google_calendar';
  source: 'internal' | 'holiday' | 'shabbat' | 'google';
  data?: ShiftScheduleData | IsraeliHoliday | ShabbatTimes | GoogleCalendarEvent;
  color?: string;
  isWorkingDay?: boolean;
}

// הוספת טיפוס לקומפוננטי תצוגה:
export interface ShiftScheduleViewProps {
  shifts: ShiftScheduleData[];
  employees: Employee[];
  currentDate: Date;
  holidays: IsraeliHoliday[];
  shabbatTimes: ShabbatTimes[];
  calendarEvents: CalendarEvent[];
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => void;
}
