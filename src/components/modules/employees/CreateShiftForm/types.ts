
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id?: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

export interface CreateShiftFormProps {
  businessId?: string;
}

export interface CreateShiftFormContainerProps {
  businessId?: string;
}

export interface CreateShiftFormViewProps {
  businessId: string;
  employees: Employee[] | undefined;
  shiftTemplates: ShiftTemplate[] | undefined;
}

export interface ShiftDatesSelectorProps {
  shiftDates: string[];
  onShiftDatesChange: (dates: string[]) => void;
  submitting: boolean;
}

export interface WeeklyRecurringSelectorProps {
  weekdayRange: { start: string; end: string };
  selectedWeekdays: number[];
  onWeekdayRangeChange: (range: { start: string; end: string }) => void;
  onSelectedWeekdaysChange: (weekdays: number[]) => void;
  submitting: boolean;
}
