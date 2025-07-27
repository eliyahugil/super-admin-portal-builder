
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SimpleEmployee {
  id: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  is_archived?: boolean;
}

// Explicit type for the query function return
type QueryResult = SimpleEmployee[];

export const useUnsubmittedEmployees = (businessId: string, employees: SimpleEmployee[], enabled: boolean) => {
  return useQuery<QueryResult>({
    queryKey: ['unsubmitted-employees', businessId],
    queryFn: async (): Promise<QueryResult> => {
      if (!businessId) {
        return [];
      }
      
      // Query submissions with explicit type
      const submissionsQuery = await supabase
        .from('shift_submissions')
        .select('employee_id')
        .eq('business_id', businessId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (submissionsQuery.error) {
        console.error('Error fetching shift submissions:', submissionsQuery.error);
        throw submissionsQuery.error;
      }

      // Build set of submitted employee IDs
      const submittedIds = new Set<string>();
      const submissions = submissionsQuery.data || [];
      
      for (const submission of submissions) {
        if (submission.employee_id) {
          submittedIds.add(submission.employee_id);
        }
      }
      
      // Filter employees
      const result: SimpleEmployee[] = [];
      for (const emp of employees) {
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
