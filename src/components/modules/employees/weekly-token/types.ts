
export interface WeeklyTokenButtonProps {
  phone: string;
  employeeName: string;
  employeeId: string;
  compact?: boolean;
}

export interface TokenData {
  id: string;
  token: string;
  employee_id: string;
  week_start_date: string;
  week_end_date: string;
  expires_at: string;
  is_active: boolean;
  context_type?: 'submission' | 'available_shifts' | 'assigned_shifts';
  shifts_published?: boolean;
  submissionUrl: string;
  advancedSubmissionUrl: string;
}

export interface LogReminderData {
  phone: string;
  message: string;
  method: string;
  status: string;
  errorDetails?: string;
}
