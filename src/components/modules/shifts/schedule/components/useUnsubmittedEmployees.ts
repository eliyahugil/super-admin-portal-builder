
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SimpleEmployee {
  id: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  is_archived?: boolean;
}

export const useUnsubmittedEmployees = (businessId: string, employees: SimpleEmployee[], enabled: boolean) => {
  return useQuery({
    queryKey: ['unsubmitted-employees', businessId],
    queryFn: async () => {
      if (!businessId) {
        return [];
      }
      
      // Simple query without explicit typing
      const { data: submissions, error } = await supabase
        .from('shift_submissions')
        .select('employee_id')
        .eq('business_id', businessId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching shift submissions:', error);
        throw error;
      }

      // Build set of submitted employee IDs with simple logic
      const submittedIds = new Set();
      if (submissions) {
        for (let i = 0; i < submissions.length; i++) {
          submittedIds.add(submissions[i].employee_id);
        }
      }
      
      // Filter employees with simple logic
      const result = [];
      for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];
        const isActive = emp.is_active !== false && emp.is_archived !== true;
        const hasNotSubmitted = !submittedIds.has(emp.id);
        
        if (isActive && hasNotSubmitted) {
          result.push(emp);
        }
      }
      
      return result;
    },
    enabled: enabled && !!businessId && employees.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
