
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicShiftToken } from '@/types/publicShift';

export const useTokenManagement = () => {
  const queryClient = useQueryClient();

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
      // Check if there's an existing token for this employee/business
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
        // Update existing token
        const { data, error } = await supabase
          .from('shift_submission_tokens')
          .update({
            week_start_date: params.week_start_date,
            week_end_date: params.week_end_date,
            expires_at: params.expires_at,
            is_active: true,
            max_submissions: params.max_submissions || 1,
            current_submissions: 0,
          })
          .eq('id', existingToken.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating token:', error);
          throw new Error('שגיאה בעדכון הטוקן');
        }

        return data;
      }

      // Generate a new unique token
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
          max_submissions: params.max_submissions || 1,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error generating token:', error);
        throw new Error('שגיאה ביצירת הטוקן');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-tokens'] });
    },
  });

  // Toggle token status (admin only)
  const toggleTokenStatus = useMutation({
    mutationFn: async ({ tokenId, isActive }: { tokenId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('shift_submission_tokens')
        .update({ is_active: isActive })
        .eq('id', tokenId);

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
      queryFn: async (): Promise<PublicShiftToken[]> => {
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

        return data || [];
      },
      enabled: !!businessId,
    });
  };

  // Get active token for a specific employee
  const useEmployeeActiveToken = (employeeId: string) => {
    return useQuery({
      queryKey: ['employeeActiveToken', employeeId],
      queryFn: async (): Promise<PublicShiftToken | null> => {
        const { data, error } = await supabase
          .from('shift_submission_tokens')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (error) throw error;
        return data;
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
      staleTime: 0,
      gcTime: 0,
    });
  };

  return {
    generateToken,
    toggleTokenStatus,
    resetSingleToken,
    resetAllTokens,
    useBusinessTokens,
    useEmployeeActiveToken,
    useTokenAvailableShifts,
  };
};
