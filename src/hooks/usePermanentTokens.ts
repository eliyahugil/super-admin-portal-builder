import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePermanentTokens = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Generate permanent tokens for employees
  const generatePermanentTokens = useMutation({
    mutationFn: async (params: {
      business_id: string;
      employee_ids?: string[];
    }) => {
      console.log('🚀 Generating permanent employee tokens:', params);
      
      const { data, error } = await supabase.functions.invoke('generate-permanent-employee-tokens', {
        body: params
      });

      if (error) {
        console.error('Error generating permanent tokens:', error);
        throw new Error(`שגיאה ביצירת טוקנים קבועים: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'שגיאה ביצירת טוקנים קבועים');
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['permanent-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['employee-permanent-token'] });
      
      toast({
        title: "הצלחה",
        description: `נוצרו ${data.successful_tokens} טוקנים קבועים בהצלחה`,
      });

      if (data.failed_tokens > 0) {
        toast({
          title: "התראה",
          description: `נכשלו ${data.failed_tokens} טוקנים`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : 'שגיאה ביצירת טוקנים קבועים',
        variant: "destructive",
      });
    }
  });

  // Get employee permanent token
  const useEmployeePermanentToken = (employeeId: string) => {
    return useQuery({
      queryKey: ['employee-permanent-token', employeeId],
      queryFn: async () => {
        if (!employeeId) return null;
        
        const { data, error } = await supabase
          .from('employee_permanent_tokens')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('is_active', true)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') { // Not found is OK
          throw error;
        }
        return data;
      },
      enabled: !!employeeId,
    });
  };

  // Get permanent token shifts
  const getPermanentTokenShifts = useMutation({
    mutationFn: async (params: {
      token: string;
      weekOffset?: number;
      weekStart?: string;
      weekEnd?: string;
    }) => {
      console.log('📅 Getting shifts for permanent token:', params.token.substring(0, 8) + '...', 'Week offset:', params.weekOffset);
      
      const { data, error } = await supabase.functions.invoke('get-employee-permanent-shifts', {
        body: params
      });

      if (error) {
        console.error('Error getting permanent token shifts:', error);
        throw new Error(`שגיאה בקבלת משמרות: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'שגיאה בקבלת משמרות');
      }

      return data;
    },
  });

  // Validate permanent token
  const validatePermanentToken = useMutation({
    mutationFn: async (params: {
      token: string;
    }) => {
      console.log('🔍 Validating permanent token:', params.token.substring(0, 8) + '...');
      
      const { data, error } = await supabase.functions.invoke('validate-permanent-token', {
        body: params
      });

      if (error) {
        console.error('Error validating permanent token:', error);
        throw new Error(`שגיאה באימות טוקן: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'טוקן לא תקין');
      }

      return data;
    },
  });

  // Get all permanent tokens for business
  const usePermanentTokens = (businessId: string) => {
    return useQuery({
      queryKey: ['permanent-tokens', businessId],
      queryFn: async () => {
        if (!businessId) return [];
        
        const { data, error } = await supabase
          .from('employee_permanent_tokens')
          .select(`
            *,
            employee:employees(
              id,
              first_name,
              last_name,
              employee_id,
              phone
            )
          `)
          .eq('business_id', businessId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      enabled: !!businessId,
    });
  };

  return {
    generatePermanentTokens,
    useEmployeePermanentToken,
    getPermanentTokenShifts,
    validatePermanentToken,
    usePermanentTokens,
  };
};