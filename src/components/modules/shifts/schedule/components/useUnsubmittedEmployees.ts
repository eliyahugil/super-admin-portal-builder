
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SimpleEmployee {
  id: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  is_archived?: boolean;
}

// Simple type for database result
type SubmissionResult = {
  employee_id: string | null;
};

// Separate async function to avoid deep type instantiation in useQuery
const fetchSubmissions = async (businessId: string): Promise<SubmissionResult[]> => {
  const { data, error } = await supabase
    .from('shift_submissions')
    .select('employee_id')
    .eq('business_id', businessId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error fetching shift submissions:', error);
    throw error;
  }

  return (data || []) as SubmissionResult[];
};

// Separate function to filter employees
const filterUnsubmittedEmployees = (
  employees: SimpleEmployee[], 
  submissions: SubmissionResult[]
): SimpleEmployee[] => {
  const submittedIds = new Set<string>();
  
  submissions.forEach(submission => {
    if (submission.employee_id) {
      submittedIds.add(submission.employee_id);
    }
  });

  return employees.filter(emp => {
    const isActive = emp.is_active !== false && emp.is_archived !== true;
    const hasNotSubmitted = !submittedIds.has(emp.id);
    return isActive && hasNotSubmitted;
  });
};

export const useUnsubmittedEmployees = (businessId: string, employees: SimpleEmployee[], enabled: boolean) => {
  return useQuery<SimpleEmployee[], Error>({
    queryKey: ['unsubmitted-employees', businessId],
    queryFn: async (): Promise<SimpleEmployee[]> => {
      if (!businessId) {
        return [];
      }
      
      const submissions = await fetchSubmissions(businessId);
      return filterUnsubmittedEmployees(employees, submissions);
    },
    enabled: enabled && !!businessId && employees.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
