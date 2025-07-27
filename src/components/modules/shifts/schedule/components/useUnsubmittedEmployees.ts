
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
      if (!businessId) return [];
      
      const { data: submissions } = await supabase
        .from('shift_submissions')
        .select('employee_id')
        .eq('business_id', businessId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const submittedIds = new Set(submissions?.map(s => s.employee_id) || []);
      
      return employees.filter(emp => 
        emp.is_active !== false && 
        emp.is_archived !== true && 
        !submittedIds.has(emp.id)
      );
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};
