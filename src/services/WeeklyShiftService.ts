
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
  scheduled_shift_id?: string; // Add this to track selected scheduled shift
}

export interface WeeklySubmissionData {
  shifts: ShiftEntry[];
  week_start_date: string;
  week_end_date: string;
  notes?: string;
  optional_morning_availability?: number[]; // Days available for optional morning shifts
}

export class WeeklyShiftService {
  // Generate a weekly token for an employee (or return existing one)
  static async generateWeeklyToken(employeeId: string, weekStartDate: string, weekEndDate: string): Promise<string> {
    console.log('🔍 Checking for existing token for employee:', employeeId, 'week:', weekStartDate);
    
    // First, check if token already exists for this employee and week
    const { data: existingToken, error: checkError } = await supabase
      .from('employee_weekly_tokens')
      .select('token, is_active')
      .eq('employee_id', employeeId)
      .eq('week_start_date', weekStartDate)
      .eq('week_end_date', weekEndDate)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking existing token:', checkError);
      throw checkError;
    }

    // If token exists and is active, return it
    if (existingToken && existingToken.is_active) {
      console.log('✅ Found existing active token:', existingToken.token);
      return existingToken.token;
    }

    // If token exists but is inactive, activate it and return it
    if (existingToken && !existingToken.is_active) {
      console.log('🔄 Found inactive token, reactivating:', existingToken.token);
      const { error: updateError } = await supabase
        .from('employee_weekly_tokens')
        .update({ is_active: true })
        .eq('token', existingToken.token);
      
      if (updateError) {
        console.error('❌ Error reactivating token:', updateError);
        throw updateError;
      }
      
      console.log('✅ Token reactivated successfully');
      return existingToken.token;
    }

    // No existing token found, create a new one
    console.log('🆕 Creating new token for employee:', employeeId);
    const token = crypto.randomUUID(); // Keep it as UUID, not converting to string
    const expiresAt = new Date(weekEndDate);
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires one week after the week ends

    try {
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

      if (error) {
        // If it's a unique constraint violation, fetch the existing token
        if (error.code === '23505') {
          console.log('🔄 Token already exists due to race condition, fetching existing...');
          const { data: existingData } = await supabase
            .from('employee_weekly_tokens')
            .select('token')
            .eq('employee_id', employeeId)
            .eq('week_start_date', weekStartDate)
            .eq('week_end_date', weekEndDate)
            .single();
          
          if (existingData) {
            console.log('✅ Found existing token after race condition:', existingData.token);
            return existingData.token;
          }
        }
        
        console.error('❌ Error creating new token:', error);
        throw error;
      }
      
      console.log('✅ Created new token:', data.token);
      return data.token;
    } catch (err) {
      console.error('❌ Unexpected error creating token:', err);
      throw err;
    }
  }

  // Validate weekly token using edge function to bypass RLS
  static async validateWeeklyToken(token: string): Promise<any> {
    console.log('🔍 Starting token validation for:', token);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-weekly-token', {
        body: { token }
      });

      if (error) {
        console.error('❌ Token validation error:', error);
        return null;
      }

      if (!data?.data) {
        console.error('❌ No token data returned');
        return null;
      }

      console.log('✅ Token validated successfully:', {
        tokenId: data.data.id,
        employeeId: data.data.employee_id,
        weekStart: data.data.week_start_date,
        weekEnd: data.data.week_end_date,
        hasEmployeeData: !!data.data.employee
      });

      return data.data;
    } catch (error) {
      console.error('💥 Token validation failed:', error);
      return null;
    }
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

    // Insert shift submission - convert shifts array to JSON
    const { error: submissionError } = await supabase
      .from('shift_submissions')
      .insert({
        employee_id: tokenData.employee_id,
        token,
        shifts: JSON.stringify(submissionData.shifts),
        week_start_date: submissionData.week_start_date,
        week_end_date: submissionData.week_end_date,
        notes: submissionData.notes,
        optional_morning_availability: submissionData.optional_morning_availability,
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

  // Reset token when submissions are deleted
  static async resetTokenAfterDeletion(token: string): Promise<boolean> {
    try {
      console.log('🔄 Resetting token after submission deletion:', token);
      
      // Check if token exists
      const { data: tokenData, error: tokenError } = await supabase
        .from('employee_weekly_tokens')
        .select('id, is_active')
        .eq('token', token)
        .single();

      if (tokenError || !tokenData) {
        console.error('❌ Token not found:', tokenError);
        return false;
      }

      // Reactivate the token
      const { error: updateError } = await supabase
        .from('employee_weekly_tokens')
        .update({ is_active: true })
        .eq('token', token);

      if (updateError) {
        console.error('❌ Error reactivating token:', updateError);
        throw updateError;
      }

      console.log('✅ Token reactivated successfully');
      return true;
    } catch (error) {
      console.error('💥 Error resetting token:', error);
      throw error;
    }
  }

  // Get all weekly tokens for a business
  static async getWeeklyTokensForBusiness(businessId: string) {
    const { data, error } = await supabase
      .from('employee_weekly_tokens')
      .select(`
        *,
        employee:employees!inner(first_name, last_name, employee_id, phone, business_id)
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
        employee:employees!inner(first_name, last_name, employee_id, phone, business_id)
      `)
      .eq('employee.business_id', businessId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}
