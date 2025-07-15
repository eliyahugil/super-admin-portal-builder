
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
    try {
      console.log('🔄 Generating token for employee:', employeeId);
      
      // Generate a simple string token (not UUID) for shift_tokens table
      const token = crypto.randomUUID().replace(/-/g, '');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      console.log('📝 Inserting into shift_tokens table with token:', token);

      const { data, error } = await supabase
        .from('shift_tokens')
        .insert({
          employee_id: employeeId,
          token,
          expires_at: expiresAt.toISOString(),
        })
        .select('token')
        .single();

      if (error) {
        console.error('❌ Error inserting shift token:', error);
        throw new Error(`Failed to generate shift token: ${error.message}`);
      }

      console.log('✅ Shift token generated successfully:', data.token);
      return data.token;
    } catch (error) {
      console.error('❌ ShiftTokenService.generateToken error:', error);
      throw error;
    }
  }

  // Validate token and get token data
  static async validateToken(token: string): Promise<ShiftToken | null> {
    try {
      console.log('🔍 Validating token:', token);
      
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

      if (error) {
        console.log('⚠️ Token validation failed:', error.message);
        return null;
      }
      
      console.log('✅ Token validated successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ ShiftTokenService.validateToken error:', error);
      return null;
    }
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

    // Mark token as used - fix the type issue by converting to plain object
    const { error: updateError } = await supabase
      .from('shift_tokens')
      .update({
        is_used: true,
        submitted_data: JSON.parse(JSON.stringify(shiftData)),
      })
      .eq('token', token);

    if (updateError) throw updateError;
    return true;
  }

  // Get all tokens for a business
  static async getTokensForBusiness(businessId: string) {
    try {
      console.log('📋 Fetching tokens for business:', businessId);
      
      const { data, error } = await supabase
        .from('shift_tokens')
        .select(`
          *,
          employee:employees!inner(first_name, last_name, employee_id, business_id)
        `)
        .eq('employee.business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching business tokens:', error);
        throw new Error(`Failed to fetch tokens: ${error.message}`);
      }
      
      console.log('✅ Fetched tokens successfully:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('❌ ShiftTokenService.getTokensForBusiness error:', error);
      throw error;
    }
  }
}
