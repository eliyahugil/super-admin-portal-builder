
import { supabase } from '@/integrations/supabase/client';

export interface WeeklyShiftSubmission {
  id: string;
  employee_id: string;
  token: string;
  submitted_at: string;
  shifts: ShiftEntry[];
  week_start_date: string;
  week_end_date: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ShiftEntry {
  date: string;
  start_time: string;
  end_time: string;
  branch_preference: string;
  role_preference?: string;
  notes?: string;
}

export interface WeeklySubmissionData {
  shifts: ShiftEntry[];
  week_start_date: string;
  week_end_date: string;
  notes?: string;
}

export class WeeklyShiftService {
  // Generate a weekly token for an employee
  static async generateWeeklyToken(employeeId: string, weekStartDate: string, weekEndDate: string): Promise<string> {
    const token = crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(weekEndDate);
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires one week after the week ends

    const { data, error } = await supabase
      .from('employee_weekly_tokens')
      .insert({
        employee_id: employeeId,
        token,
        week_start_date: weekStartDate,
        week_end_date: weekEndDate,
        expires_at: expiresAt.toISOString(),
      })
      .select('token')
      .single();

    if (error) throw error;
    return data.token;
  }

  // Validate weekly token and get token data
  static async validateWeeklyToken(token: string): Promise<any> {
    const { data, error } = await supabase
      .from('employee_weekly_tokens')
      .select(`
        *,
        employee:employees(first_name, last_name, employee_id)
      `)
      .eq('token', token)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) return null;
    return data;
  }

  // Submit weekly shifts using token
  static async submitWeeklyShifts(token: string, submissionData: WeeklySubmissionData): Promise<boolean> {
    const tokenData = await this.validateWeeklyToken(token);
    if (!tokenData) throw new Error('Invalid or expired token');

    // Check if already submitted
    const { data: existingSubmission } = await supabase
      .from('shift_submissions')
      .select('id')
      .eq('token', token)
      .single();

    if (existingSubmission) {
      throw new Error('Shifts already submitted for this week');
    }

    // Insert shift submission
    const { error: submissionError } = await supabase
      .from('shift_submissions')
      .insert({
        employee_id: tokenData.employee_id,
        token,
        shifts: submissionData.shifts,
        week_start_date: submissionData.week_start_date,
        week_end_date: submissionData.week_end_date,
        notes: submissionData.notes,
      });

    if (submissionError) throw submissionError;

    // Deactivate the token
    const { error: updateError } = await supabase
      .from('employee_weekly_tokens')
      .update({ is_active: false })
      .eq('token', token);

    if (updateError) throw updateError;
    return true;
  }

  // Get all weekly tokens for a business
  static async getWeeklyTokensForBusiness(businessId: string) {
    const { data, error } = await supabase
      .from('employee_weekly_tokens')
      .select(`
        *,
        employee:employees!inner(first_name, last_name, employee_id, business_id)
      `)
      .eq('employee.business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get shift submissions for a business
  static async getShiftSubmissionsForBusiness(businessId: string) {
    const { data, error } = await supabase
      .from('shift_submissions')
      .select(`
        *,
        employee:employees!inner(first_name, last_name, employee_id, business_id)
      `)
      .eq('employee.business_id', businessId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}
