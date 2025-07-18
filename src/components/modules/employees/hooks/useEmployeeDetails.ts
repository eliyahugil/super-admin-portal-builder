
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { getUpcomingWeekDates } from '@/lib/dateUtils';

export const useEmployeeDetails = (employeeId: string | undefined) => {
  const { businessId } = useBusiness();

  // Get employee details
  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: ['employee-details', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          main_branch:branches(name)
        `)
        .eq('id', employeeId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Get employee documents
  const { data: documents } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Get regular shift submissions (non-special submissions)
  const { data: submissions } = useQuery({
    queryKey: ['employee-regular-submissions', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('shift_submissions')
        .select(`
          *,
          employees!inner(
            id,
            first_name,
            last_name
          )
        `)
        .eq('employee_id', employeeId)
        .or('submission_type.eq.regular,submission_type.is.null')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // Get employee notes
  const { data: notes } = useQuery({
    queryKey: ['employee-notes-summary', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('employee_notes')
        .select(`
          *,
          creator:profiles(full_name)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // מערכת הטוקנים הוסרה
  const permanentToken: string | null = null;

  return {
    employee,
    documents: documents || [],
    submissions: submissions || [],
    notes: notes || [],
    permanentToken,
    isLoading: employeeLoading,
    submissionUrl: null
  };
};
