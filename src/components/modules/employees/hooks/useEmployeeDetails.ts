
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';

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

  // Get shift submissions history
  const { data: submissions } = useQuery({
    queryKey: ['employee-submissions', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('shift_submissions')
        .select('*')
        .eq('employee_id', employeeId)
        .order('week_start_date', { ascending: false });

      if (error) throw error;
      return data;
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

  // Get or create permanent submission token
  const { data: permanentToken } = useQuery({
    queryKey: ['employee-permanent-token', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      // Check if there's an active token for next week
      const nextWeek = getNextWeekDates();
      
      const { data: existingToken, error } = await supabase
        .from('employee_weekly_tokens')
        .select('token')
        .eq('employee_id', employeeId)
        .eq('week_start_date', nextWeek.start)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      
      if (existingToken) {
        return existingToken.token;
      }

      // Create new token for next week
      const newToken = crypto.randomUUID().replace(/-/g, '');
      const expiresAt = new Date(nextWeek.end);
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data: tokenData, error: insertError } = await supabase
        .from('employee_weekly_tokens')
        .insert({
          employee_id: employeeId,
          token: newToken,
          week_start_date: nextWeek.start,
          week_end_date: nextWeek.end,
          expires_at: expiresAt.toISOString(),
        })
        .select('token')
        .single();

      if (insertError) throw insertError;
      return tokenData.token;
    },
    enabled: !!employeeId,
  });

  const getNextWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const startOfNextWeek = new Date(now);
    startOfNextWeek.setDate(now.getDate() - currentDay + 7);
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

    return {
      start: startOfNextWeek.toISOString().split('T')[0],
      end: endOfNextWeek.toISOString().split('T')[0]
    };
  };

  return {
    employee,
    documents: documents || [],
    submissions: submissions || [],
    notes: notes || [],
    permanentToken,
    isLoading: employeeLoading,
    submissionUrl: permanentToken ? `${window.location.origin}/weekly-shift-submission/${permanentToken}` : null
  };
};
