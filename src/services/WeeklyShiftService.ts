// WeeklyShiftService - Token system removed

export interface WeeklyShiftSubmission {
  id: string;
  employee_id: string;
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
  scheduled_shift_id?: string;
  available_shift_id?: string;
}

export interface WeeklySubmissionData {
  shifts: ShiftEntry[];
  week_start_date: string;
  week_end_date: string;
  notes?: string;
  optional_morning_availability?: number[];
}

export class WeeklyShiftService {
  // Token system has been removed - all methods now return not available messages

  static async generateWeeklyToken(employeeId: string, weekStartDate: string, weekEndDate: string): Promise<string> {
    console.log('⚠️ Weekly token system has been removed');
    throw new Error('Weekly token system is no longer available');
  }

  static async validateToken(token: string): Promise<{ isValid: boolean; employee_id?: string; submission?: WeeklyShiftSubmission }> {
    console.log('⚠️ Token validation system has been removed');
    return { isValid: false };
  }

  static async submitWeeklyShifts(token: string, submissionData: WeeklySubmissionData): Promise<WeeklyShiftSubmission> {
    console.log('📤 Submitting weekly shifts with new system:', { token: token.substring(0, 8) + '...', submissionData });
    
    try {
      // Use the edge function for submission instead of the old token system
      const { supabase } = await import('@/integrations/supabase/client');
      
      const requestBody = { 
        token,
        ...submissionData 
      };
      console.log('📤 Edge function request body:', requestBody);
      
      const { data, error } = await supabase.functions.invoke('submit-weekly-shifts', {
        body: requestBody
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(`שגיאה בשליחת המשמרות: ${error.message}`);
      }

      if (!data?.success) {
        console.error('❌ Submission failed:', data);
        throw new Error(data?.error || 'שגיאה בשליחת המשמרות');
      }

      console.log('✅ Weekly shifts submitted successfully:', data);
      return data.submission;
    } catch (error: any) {
      console.error('💥 Weekly shift submission error:', error);
      throw new Error(error.message || 'שגיאה בשליחת משמרות השבוע');
    }
  }

  static async getSubmissionByToken(token: string): Promise<WeeklyShiftSubmission | null> {
    console.log('⚠️ Submission retrieval system has been removed');
    return null;
  }

  static async markTokenAsUsed(token: string): Promise<void> {
    console.log('⚠️ Token marking system has been removed');
  }

  static async getEmployeeTokens(employeeId: string): Promise<any[]> {
    console.log('⚠️ Employee token system has been removed');
    return [];
  }

  static async deleteExpiredTokens(): Promise<number> {
    console.log('⚠️ Token cleanup system has been removed');
    return 0;
  }

  static generateTokenHash(): string {
    console.log('⚠️ Token generation system has been removed');
    return '';
  }
}