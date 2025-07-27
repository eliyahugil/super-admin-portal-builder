
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
  return useQuery<SimpleEmployee[], Error>({
    queryKey: ['unsubmitted-employees', businessId],
    queryFn: async (): Promise<SimpleEmployee[]> => {
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

      const submittedIds = new Set<string>();
      if (submissions) {
        submissions.forEach((submission: ShiftSubmission) => {
          submittedIds.add(submission.employee_id);
        });
      }
      
      const activeEmployees = employees.filter((emp: SimpleEmployee) => 
        emp.is_active !== false && 
        emp.is_archived !== true
      );

      const unsubmittedEmployees = activeEmployees.filter((emp: SimpleEmployee) => 
        !submittedIds.has(emp.id)
      );
      
      return unsubmittedEmployees;
    },
    enabled: enabled && !!businessId && employees.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
