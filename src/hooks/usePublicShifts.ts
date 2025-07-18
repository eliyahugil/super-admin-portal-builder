import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicShiftToken, PublicShiftSubmission, PublicShiftForm } from '@/types/publicShift';

export const usePublicShifts = () => {
  const queryClient = useQueryClient();

  // Get token details by token string
  const useToken = (token: string) => {
    return useQuery({
      queryKey: ['public-token', token],
      queryFn: async () => {
        if (!token) return null;
        
        const { data, error } = await supabase
          .from('shift_submission_tokens')
          .select('*')
          .eq('token', token)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching token:', error);
          throw new Error('טוקן לא נמצא או שפג תוקפו');
        }

        // Check if token is expired
        if (new Date(data.expires_at) < new Date()) {
          throw new Error('פג תוקף הטוקן');
        }

        return data as PublicShiftToken;
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

  // Submit shifts via public token
  const submitShifts = useMutation({
    mutationFn: async ({ tokenId, formData }: { tokenId: string; formData: PublicShiftForm }) => {
      console.log('🔥 Starting submission mutation:', { tokenId, formData });
      
      const { data, error } = await supabase
        .from('public_shift_submissions')
        .insert({
          token_id: tokenId,
          employee_name: formData.employee_name,
          phone: formData.phone,
          shift_preferences: formData.preferences as any,
          notes: formData.notes,
        })
        .select()
        .single();

      console.log('🔥 Submission result:', { data, error });

      if (error) {
        console.error('Error submitting shifts:', error);
        throw new Error(`שגיאה בהגשת המשמרות: ${error.message}`);
      }

      return {
        ...data,
        shift_preferences: data.shift_preferences as any
      } as PublicShiftSubmission;
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

  // Get all tokens for a business (admin only)
  const useBusinessTokens = (businessId: string) => {
    return useQuery({
      queryKey: ['public-tokens', businessId],
      queryFn: async () => {
        if (!businessId) return [];
        
        const { data, error } = await supabase
          .from('shift_submission_tokens')
          .select('*')
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

  // Get active token for a specific employee
  const useEmployeeActiveToken = (employeeId: string) => {
    return useQuery({
      queryKey: ['employeeActiveToken', employeeId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('shift_submission_tokens')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (error) throw error;
        return data as PublicShiftToken | null;
      },
      enabled: !!employeeId,
    });
  };

  // Get available shifts for a token's date range
  const useTokenAvailableShifts = (tokenId: string) => {
    return useQuery({
      queryKey: ['tokenAvailableShifts', tokenId],
      queryFn: async () => {
        if (!tokenId) return [];

        // First get the token details
        const { data: token, error: tokenError } = await supabase
          .from('shift_submission_tokens')
          .select('*')
          .eq('id', tokenId)
          .single();

        if (tokenError) throw tokenError;

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

        if (shiftsError) throw shiftsError;
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
    resetAllTokens,
  };
};