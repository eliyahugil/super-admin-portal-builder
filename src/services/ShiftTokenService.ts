
import { supabase } from '@/integrations/supabase/client';

export interface ShiftToken {
  id: string;
  employee_id: string;
  branch_preference_1?: string;
  branch_preference_2?: string;
  token: string;
  expires_at: string;
  created_at: string;
  is_used: boolean;
  submitted_data: any;
}

export interface ShiftSubmissionData {
  shift_date: string;
  start_time: string;
  end_time: string;
  branch_preference: string;
  role_preference?: string;
  notes?: string;
}

export class ShiftTokenService {
  // Generate a unique token for an employee
  static async generateToken(employeeId: string, expiresInHours: number = 168): Promise<string> {
    const token = crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const { data, error } = await supabase
      .from('shift_tokens')
      .insert({
        employee_id: employeeId,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select('token')
      .single();

    if (error) throw error;
    return data.token;
  }

  // Validate token and get token data
  static async validateToken(token: string): Promise<ShiftToken | null> {
    const { data, error } = await supabase
      .from('shift_tokens')
      .select(`
        *,
        employee:employees(first_name, last_name, employee_id)
      `)
      .eq('token', token)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) return null;
    return data;
  }

  // Submit shift data using token
  static async submitShift(token: string, shiftData: ShiftSubmissionData): Promise<boolean> {
    const tokenData = await this.validateToken(token);
    if (!tokenData) throw new Error('Invalid or expired token');

    // Insert shift request
    const { error: shiftError } = await supabase
      .from('employee_shift_requests')
      .insert({
        employee_id: tokenData.employee_id,
        shift_date: shiftData.shift_date,
        start_time: shiftData.start_time,
        end_time: shiftData.end_time,
        branch_preference: shiftData.branch_preference,
        role_preference: shiftData.role_preference,
        notes: shiftData.notes,
        submission_token: tokenData.id,
      });

    if (shiftError) throw shiftError;

    // Mark token as used
    const { error: updateError } = await supabase
      .from('shift_tokens')
      .update({
        is_used: true,
        submitted_data: shiftData,
      })
      .eq('token', token);

    if (updateError) throw updateError;
    return true;
  }

  // Get all tokens for a business
  static async getTokensForBusiness(businessId: string) {
    const { data, error } = await supabase
      .from('shift_tokens')
      .select(`
        *,
        employee:employees!inner(first_name, last_name, employee_id, business_id)
      `)
      .eq('employee.business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}
