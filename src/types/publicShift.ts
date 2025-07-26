
export interface PublicShiftToken {
  id: string;
  token: string;
  business_id: string;
  employee_id?: string;
  week_start_date: string;
  week_end_date: string;
  expires_at: string;
  is_active: boolean;
  max_submissions?: number;
  current_submissions?: number;
  created_at: string;
}

export interface PublicShiftSubmission {
  id: string;
  employee_id: string;
  week_start_date: string;
  week_end_date: string;
  shifts: any; // JSON field containing shift data
  status: string;
  submission_type: string;
  notes?: string;
  optional_morning_availability?: number[];
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface ShiftPreference {
  // For generic shifts
  day_of_week?: number;
  shift_type?: 'morning' | 'afternoon' | 'evening' | 'night';
  
  // For existing scheduled shifts
  shift_id?: string;
  shift_date?: string;
  
  // Common fields
  start_time: string;
  end_time: string;
  role?: string;
  branch_preference?: string;
  branch_name?: string;
  available: boolean;
}

export interface PublicShiftForm {
  employee_name: string;
  phone?: string;
  preferences: ShiftPreference[];
  notes?: string;
}
