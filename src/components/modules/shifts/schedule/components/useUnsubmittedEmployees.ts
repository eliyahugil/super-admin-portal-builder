
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SimpleEmployee {
  id: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  is_archived?: boolean;
}

interface SubmissionData {
  employee_id: string | null;
}

export const useUnsubmittedEmployees = (businessId: string, employees: SimpleEmployee[], enabled: boolean) => {
  return useQuery({
    queryKey: ['unsubmitted-employees', businessId],
    queryFn: async (): Promise<SimpleEmployee[]> => {
      if (!businessId) {
        return [];
      }
      
      // Query submissions with explicit type annotation
      const { data, error }: { data: SubmissionData[] | null; error: any } = await supabase
        .from('shift_submissions')
        .select('employee_id')
        .eq('business_id', businessId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching shift submissions:', error);
        throw error;
      }

      // Build set of submitted employee IDs with explicit typing
      const submittedIds = new Set<string>();
      if (data) {
        data.forEach((submission: SubmissionData) => {
          if (submission.employee_id) {
            submittedIds.add(submission.employee_id);
          }
        });
      }
      
      // Filter employees with explicit return type
      const filteredEmployees: SimpleEmployee[] = employees.filter((emp: SimpleEmployee) => {
        const isActive = emp.is_active !== false && emp.is_archived !== true;
        const hasNotSubmitted = !submittedIds.has(emp.id);
        return isActive && hasNotSubmitted;
      });
      
      return filteredEmployees;
    },
    enabled: enabled && !!businessId && employees.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
