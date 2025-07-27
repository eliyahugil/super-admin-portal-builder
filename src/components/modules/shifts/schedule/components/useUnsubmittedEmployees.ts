
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SimpleEmployee {
  id: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  is_archived?: boolean;
}

// Explicitly type the submission data from Supabase
interface SubmissionData {
  employee_id: string;
}

export const useUnsubmittedEmployees = (businessId: string, employees: SimpleEmployee[], enabled: boolean) => {
  return useQuery({
    queryKey: ['unsubmitted-employees', businessId],
    queryFn: async (): Promise<SimpleEmployee[]> => {
      if (!businessId) {
        return [];
      }
      
      // Explicitly type the query result
      const { data: submissions, error } = await supabase
        .from('shift_submissions')
        .select('employee_id')
        .eq('business_id', businessId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) as {
        data: SubmissionData[] | null;
        error: any;
      };

      if (error) {
        console.error('Error fetching shift submissions:', error);
        throw error;
      }

      // Build set of submitted employee IDs
      const submittedIds = new Set<string>();
      if (submissions) {
        submissions.forEach(submission => {
          submittedIds.add(submission.employee_id);
        });
      }
      
      // Filter employees using simple operations
      return employees.filter(emp => {
        // Check if employee is active
        const isActive = emp.is_active !== false && emp.is_archived !== true;
        // Check if employee hasn't submitted
        const hasNotSubmitted = !submittedIds.has(emp.id);
        return isActive && hasNotSubmitted;
      });
    },
    enabled: enabled && !!businessId && employees.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
