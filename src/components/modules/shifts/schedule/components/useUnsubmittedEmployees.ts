
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SimpleEmployee {
  id: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  is_archived?: boolean;
}

interface ShiftSubmission {
  employee_id: string;
}

export const useUnsubmittedEmployees = (businessId: string, employees: SimpleEmployee[], enabled: boolean) => {
  return useQuery({
    queryKey: ['unsubmitted-employees', businessId],
    queryFn: async () => {
      if (!businessId) {
        return [];
      }
      
      const { data: submissions, error } = await supabase
        .from('shift_submissions')
        .select('employee_id')
        .eq('business_id', businessId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching shift submissions:', error);
        throw error;
      }

      // Build set of submitted employee IDs
      const submittedIds: Set<string> = new Set();
      if (submissions) {
        for (const submission of submissions) {
          submittedIds.add(submission.employee_id);
        }
      }
      
      // Filter active employees first
      const activeEmployees: SimpleEmployee[] = [];
      for (const emp of employees) {
        if (emp.is_active !== false && emp.is_archived !== true) {
          activeEmployees.push(emp);
        }
      }

      // Filter out employees who have submitted
      const unsubmittedEmployees: SimpleEmployee[] = [];
      for (const emp of activeEmployees) {
        if (!submittedIds.has(emp.id)) {
          unsubmittedEmployees.push(emp);
        }
      }
      
      return unsubmittedEmployees;
    },
    enabled: enabled && !!businessId && employees.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
