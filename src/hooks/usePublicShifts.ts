import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicShiftToken, PublicShiftSubmission, PublicShiftForm } from '@/types/publicShift';

export const usePublicShifts = () => {
  const queryClient = useQueryClient();

  // Get token details by token string - updated for employee weekly tokens
  const useToken = (token: string) => {
    return useQuery({
      queryKey: ['public-token', token],
      queryFn: async () => {
        if (!token) return null;
        
        // Call edge function to validate token
        const { data, error } = await supabase.functions.invoke('validate-weekly-token', {
          body: { token }
        });

        if (error) {
          console.error('Error validating token:', error);
          throw new Error('טוקן לא נמצא או שפג תוקפו');
        }

        if (!data.data) {
          throw new Error('טוקן לא תקין');
        }

        return data.data as PublicShiftToken;
      },
      enabled: !!token,
    });
  };

  // Get submissions for a token
  const useTokenSubmissions = (tokenId: string) => {
    return useQuery({
      queryKey: ['token-submissions', tokenId],
      queryFn: async () => {
        if (!tokenId) return [];
        
        const { data, error } = await supabase
          .from('public_shift_submissions')
          .select('*')
          .eq('token_id', tokenId)
          .order('submitted_at', { ascending: false });

        if (error) {
          console.error('Error fetching submissions:', error);
          return [];
        }

        return data.map(item => ({
          ...item,
          shift_preferences: item.shift_preferences as any
        })) as PublicShiftSubmission[];
      },
      enabled: !!tokenId,
    });
  };

  // Submit shifts via public token using the new edge function
  const submitShifts = useMutation({
    mutationFn: async ({ tokenId, formData }: { tokenId: string; formData: PublicShiftForm }) => {
      console.log('🔥 Starting submission mutation:', { tokenId, formData });
      
      // Get the token string from the token ID first
      const { data: tokenData, error: tokenError } = await supabase
        .from('shift_submission_tokens')
        .select('token, week_start_date, week_end_date')
        .eq('id', tokenId)
        .single();

      if (tokenError || !tokenData) {
        throw new Error(`שגיאה בקבלת פרטי הטוקן: ${tokenError?.message}`);
      }

      // Convert shift preferences to the format expected by the edge function
      const shifts = formData.preferences.map(pref => ({
        date: pref.shift_date || '',
        start_time: pref.start_time,
        end_time: pref.end_time,
        branch_preference: pref.branch_name || '',
        role_preference: pref.role,
        notes: '', // ShiftPreference doesn't have notes, so use empty string
        available_shift_id: pref.shift_id
      }));

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('submit-weekly-shifts', {
        body: {
          token: tokenData.token,
          shifts,
          week_start_date: tokenData.week_start_date,
          week_end_date: tokenData.week_end_date,
          notes: formData.notes
        }
      });

      console.log('🔥 Edge function result:', { data, error });

      if (error) {
        console.error('Error submitting shifts via edge function:', error);
        throw new Error(`שגיאה בהגשת המשמרות: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'שגיאה בהגשת המשמרות');
      }

      return data.submission;
    },
    onSuccess: (_, { tokenId }) => {
      queryClient.invalidateQueries({ queryKey: ['token-submissions', tokenId] });
    },
  });

  // Generate new token (admin only)
  const generateToken = useMutation({
    mutationFn: async (params: {
      business_id: string;
      employee_id?: string;
      week_start_date: string;
      week_end_date: string;
      expires_at: string;
      max_submissions?: number;
    }) => {
      // Check if there's an existing token for this employee/business (reuse existing token)
      let existingToken;
      if (params.employee_id) {
        const { data } = await supabase
          .from('shift_submission_tokens')
          .select('*')
          .eq('employee_id', params.employee_id)
          .eq('business_id', params.business_id)
          .maybeSingle();
        existingToken = data;
      } else {
        const { data } = await supabase
          .from('shift_submission_tokens')
          .select('*')
          .is('employee_id', null)
          .eq('business_id', params.business_id)
          .maybeSingle();
        existingToken = data;
      }

      if (existingToken) {
        // Update existing token with new week dates and activate it
        const { data, error } = await supabase
          .from('shift_submission_tokens')
          .update({
            week_start_date: params.week_start_date,
            week_end_date: params.week_end_date,
            expires_at: params.expires_at,
            is_active: true,
            max_submissions: params.max_submissions || 50,
          })
          .eq('id', existingToken.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating token:', error);
          throw new Error('שגיאה בעדכון הטוקן');
        }

        return data as PublicShiftToken;
      }

      // Generate a new unique token if none exists
      const token = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('shift_submission_tokens')
        .insert({
          token,
          business_id: params.business_id,
          employee_id: params.employee_id || null,
          week_start_date: params.week_start_date,
          week_end_date: params.week_end_date,
          expires_at: params.expires_at,
          max_submissions: params.max_submissions || 50,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error generating token:', error);
        throw new Error('שגיאה ביצירת הטוקן');
      }

      return data as PublicShiftToken;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-tokens'] });
    },
  });

  // Toggle token status (admin only)
  const toggleTokenStatus = useMutation({
    mutationFn: async ({ tokenId, isActive }: { tokenId: string; isActive: boolean }) => {
      const { error } = await supabase.rpc('toggle_token_status', {
        token_id_param: tokenId,
        new_status: isActive
      });

      if (error) {
        console.error('Error toggling token status:', error);
        throw new Error('שגיאה בשינוי סטטוס הטוקן');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-tokens'] });
    },
  });

  // Reset single token (admin only)
  const resetSingleToken = useMutation({
    mutationFn: async (tokenId: string) => {
      // Deactivate specific token
      const { data, error } = await supabase
        .from('shift_submission_tokens')
        .update({ is_active: false })
        .eq('id', tokenId)
        .eq('is_active', true)
        .select()
        .single();

      if (error) {
        console.error('Error resetting token:', error);
        throw new Error('שגיאה באיפוס הטוקן');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-tokens'] });
    },
  });

  // Reset all tokens for a business (admin only)
  const resetAllTokens = useMutation({
    mutationFn: async (businessId: string) => {
      // Deactivate all active tokens for this business
      const { data, error } = await supabase
        .from('shift_submission_tokens')
        .update({ is_active: false })
        .eq('business_id', businessId)
        .eq('is_active', true)
        .select();

      if (error) {
        console.error('Error resetting tokens:', error);
        throw new Error('שגיאה באיפוס הטוקנים');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-tokens'] });
    },
  });

  // Get all tokens for a business (admin only) - updated for weekly tokens
  const useBusinessTokens = (businessId: string) => {
    return useQuery({
      queryKey: ['public-tokens', businessId],
      queryFn: async () => {
        if (!businessId) return [];
        
        const { data, error } = await supabase
          .from('employee_weekly_tokens')
          .select(`
            *,
            employee:employees(first_name, last_name, employee_id)
          `)
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching business tokens:', error);
          return [];
        }

        return data as PublicShiftToken[];
      },
      enabled: !!businessId,
    });
  };

  // Get active token for a specific employee - updated for weekly tokens
  const useEmployeeActiveToken = (employeeId: string) => {
    return useQuery({
      queryKey: ['employeeActiveToken', employeeId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('employee_weekly_tokens')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (error) throw error;
        return data as PublicShiftToken | null;
      },
      enabled: !!employeeId,
    });
  };

  // Get available shifts for a token's date range - UPDATED for new system
  const useTokenAvailableShifts = (tokenId: string) => {
    return useQuery({
      queryKey: ['tokenAvailableShifts', tokenId],
      queryFn: async () => {
        if (!tokenId) return [];

        // First get the token details from new table
        const { data: token, error: tokenError } = await supabase
          .from('employee_weekly_tokens')
          .select('*')
          .eq('id', tokenId)
          .maybeSingle();

        if (tokenError || !token) {
          console.error('Token error:', tokenError);
          return [];
        }

        // Then get available shifts for the token's date range
        const { data: availableShifts, error: shiftsError } = await supabase
          .from('available_shifts')
          .select(`
            *,
            branches (
              id,
              name
            )
          `)
          .eq('business_id', token.business_id)
          .eq('week_start_date', token.week_start_date)
          .eq('week_end_date', token.week_end_date)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true });

        if (shiftsError) {
          console.error('Shifts error:', shiftsError);
          return [];
        }
        
        return availableShifts || [];
      },
      enabled: !!tokenId,
      // Force refetch every time to get latest data
      staleTime: 0,
      gcTime: 0,
    });
  };

  return {
    useToken,
    useTokenSubmissions,
    submitShifts,
    generateToken,
    toggleTokenStatus,
    useBusinessTokens,
    useEmployeeActiveToken,
    useTokenAvailableShifts,
    resetSingleToken,
    resetAllTokens,
  };
};