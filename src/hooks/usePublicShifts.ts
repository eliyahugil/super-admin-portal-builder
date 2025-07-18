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

      if (error) {
        console.error('Error submitting shifts:', error);
        throw new Error('שגיאה בהגשת המשמרות');
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
      // Generate a unique token
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

  return {
    useToken,
    useTokenSubmissions,
    submitShifts,
    generateToken,
    useBusinessTokens,
  };
};