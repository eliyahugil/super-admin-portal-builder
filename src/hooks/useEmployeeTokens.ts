import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEmployeeTokens = () => {
  const queryClient = useQueryClient();

  // Generate tokens for all employees
  const generateEmployeeTokens = useMutation({
    mutationFn: async (params: {
      business_id: string;
      week_start_date: string;
      week_end_date: string;
      employee_ids?: string[];
    }) => {
      console.log('🚀 Generating employee tokens:', params);
      
      const { data, error } = await supabase.functions.invoke('generate-employee-tokens', {
        body: params
      });

      if (error) {
        console.error('Error generating employee tokens:', error);
        throw new Error(`שגיאה ביצירת טוקנים: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'שגיאה ביצירת טוקנים');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['employeeActiveToken'] });
    },
  });

  // Get weekly shifts for a specific token
  const getWeeklyShifts = useMutation({
    mutationFn: async (params: {
      token: string;
      week_start_date?: string;
    }) => {
      console.log('📅 Getting weekly shifts:', params);
      
      const { data, error } = await supabase.functions.invoke('get-weekly-shifts-for-employee', {
        body: params
      });

      if (error) {
        console.error('Error getting weekly shifts:', error);
        throw new Error(`שגיאה בקבלת משמרות: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'שגיאה בקבלת משמרות');
      }

      return data;
    },
  });

  // Reset all tokens for a business and generate new ones
  const resetAndGenerateTokens = useMutation({
    mutationFn: async (params: {
      business_id: string;
      week_start_date: string;
      week_end_date: string;
    }) => {
      console.log('🔄 Resetting and generating new tokens:', params);
      
      // First delete all existing tokens for this business
      const { error: deleteError } = await supabase
        .from('employee_weekly_tokens')
        .delete()
        .eq('business_id', params.business_id);

      if (deleteError) {
        console.error('Error deleting existing tokens:', deleteError);
        throw new Error('שגיאה במחיקת טוקנים קיימים');
      }

      // Then generate new tokens
      const { data, error } = await supabase.functions.invoke('generate-employee-tokens', {
        body: params
      });

      if (error) {
        console.error('Error generating new tokens:', error);
        throw new Error(`שגיאה ביצירת טוקנים חדשים: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'שגיאה ביצירת טוקנים חדשים');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['employeeActiveToken'] });
    },
  });

  return {
    generateEmployeeTokens,
    getWeeklyShifts,
    resetAndGenerateTokens,
  };
};