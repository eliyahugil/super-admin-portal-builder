import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type ShiftStatus = "pending" | "approved" | "rejected" | "completed";
type ShiftPriority = "critical" | "normal" | "backup";

function parseStatus(status: string | null): ShiftStatus {
  if (status === "pending" || status === "approved" || status === "rejected" || status === "completed") {
    return status;
  }
  return "pending"; // Default fallback
}

function parsePriority(priority: string | null): ShiftPriority {
  if (priority === "critical" || priority === "normal" || priority === "backup") {
    return priority;
  }
  return "normal"; // Default fallback
}

function parseShiftAssignments(assignments: any): { id: string; type: "חובה" | "תגבור"; employee_id: string; position: number; is_required: boolean; }[] {
  console.log('🔄 parseShiftAssignments called with:', {
    assignments,
    assignmentsType: typeof assignments,
    isArray: Array.isArray(assignments),
    isNull: assignments === null,
    isUndefined: assignments === undefined
  });
  
  if (!assignments) {
    console.log('📝 parseShiftAssignments: returning empty array (no assignments)');
    return [];
  }
  
  // If it's a string, parse it
  if (typeof assignments === 'string') {
    try {
      const parsed = JSON.parse(assignments);
      console.log('📝 parseShiftAssignments: parsed from string:', parsed);
      return parsed;
    } catch (error) {
      console.log('❌ parseShiftAssignments: failed to parse string:', error);
      return [];
    }
  }
  
  // If it's already an array, return it
  if (Array.isArray(assignments)) {
    console.log('📝 parseShiftAssignments: returning array as-is:', assignments);
    return assignments;
  }
  
  console.log('📝 parseShiftAssignments: returning empty array (unknown type)');
  return [];
}

export const useShiftScheduleData = (businessId: string | null) => {
  console.log('🔄 useShiftScheduleData hook initialized with businessId:', businessId);

  // Fetch shifts
  const { data: shifts = [], isLoading: shiftsLoading, error: shiftsError, refetch: refetchShifts } = useQuery({
    queryKey: ['schedule-shifts', businessId],
    queryFn: async () => {
      if (!businessId) {
        console.log('❌ No business ID provided for shifts');
        return [];
      }

      console.log('🔍 Fetching shifts for business:', businessId);

      const { data, error } = await supabase
        .from('scheduled_shifts')
        .select(`
          id,
          business_id,
          shift_date,
          start_time,
          end_time,
          employee_id,
          branch_id,
          role,
          notes,
          status,
          is_assigned,
          is_archived,
          created_at,
          updated_at,
          is_new,
          required_employees,
          shift_assignments,
          priority,
          employee:employees(id, first_name, last_name, phone, business_id),
          branch:branches(id, name, business_id)
        `)
        .eq('business_id', businessId)
        .eq('is_archived', false)
        .order('shift_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('❌ Error fetching shifts:', error);
        throw error;
      }

      console.log('✅ Fetched shifts:', data?.length || 0);

      return (data || []).map(shift => ({
        ...shift,
        status: parseStatus(shift.status),
        priority: parsePriority(shift.priority),
        shift_assignments: parseShiftAssignments(shift.shift_assignments),
        branch_name: shift.branch?.name || 'ללא סניף'
      }));
    },
    enabled: !!businessId,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60, // 1 minute
  });

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading, error: employeesError } = useQuery({
    queryKey: ['schedule-employees', businessId],
    queryFn: async () => {
      if (!businessId) {
        console.log('❌ No business ID provided for employees');
        return [];
      }

      console.log('🔍 Fetching employees for business:', businessId);

      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          business_id,
          first_name,
          last_name,
          email,
          phone,
          employee_id,
          employee_type,
          hire_date,
          is_active,
          is_archived,
          weekly_hours_required,
          notes,
          created_at,
          updated_at
        `)
        .eq('business_id', businessId)
        .eq('is_active', true)
        .eq('is_archived', false)
        .order('first_name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching employees:', error);
        throw error;
      }

      console.log('✅ Fetched employees:', data?.length || 0);
      return data || [];
    },
    enabled: !!businessId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch branches
  const { data: branches = [], isLoading: branchesLoading, error: branchesError } = useQuery({
    queryKey: ['schedule-branches', businessId],
    queryFn: async () => {
      if (!businessId) {
        console.log('❌ No business ID provided for branches');
        return [];
      }

      console.log('🔍 Fetching branches for business:', businessId);

      const { data, error } = await supabase
        .from('branches')
        .select(`
          id,
          business_id,
          name,
          address,
          latitude,
          longitude,
          gps_radius,
          is_active,
          is_archived,
          created_at,
          updated_at
        `)
        .eq('business_id', businessId)
        .eq('is_active', true)
        .eq('is_archived', false)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching branches:', error);
        throw error;
      }

      console.log('✅ Fetched branches:', data?.length || 0);

      // Security check: ensure all branches belong to the business
      const validBranches = (data || []).filter(branch => branch.business_id === businessId);
      if (validBranches.length !== (data || []).length) {
        console.warn('⚠️ Some branches did not belong to the business and were filtered out');
      }

      return validBranches;
    },
    enabled: !!businessId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch shift submissions for display in schedule
  const { data: pendingSubmissions = [], isLoading: submissionsLoading, error: submissionsError } = useQuery({
    queryKey: ['shift-submissions', businessId],
    queryFn: async () => {
      if (!businessId) {
        console.log('❌ No business ID provided for shift submissions');
        return [];
      }

      console.log('🔍 Fetching shift submissions for business:', businessId);

      // Join with employees table to filter by business_id
      const { data, error } = await supabase
        .from('shift_submissions')
        .select(`
          *,
          employees!inner(
            id,
            first_name,
            last_name,
            employee_id,
            business_id
          )
        `)
        .eq('employees.business_id', businessId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching shift submissions:', error);
        throw error;
      }

      console.log('✅ Fetched shift submissions:', data?.length || 0);
      console.log('🔍 Submission types found:', data?.map(s => ({ id: s.id, submission_type: s.submission_type })));
      return data || [];
    },
    enabled: !!businessId,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60, // 1 minute
  });

  const loading = shiftsLoading || employeesLoading || branchesLoading || submissionsLoading;
  const error = shiftsError || employeesError || branchesError || submissionsError;

  console.log('📊 useShiftScheduleData summary:', {
    businessId,
    shiftsCount: shifts.length,
    employeesCount: employees.length,
    branchesCount: branches.length,
    pendingSubmissionsCount: pendingSubmissions.length,
    loading,
    hasError: !!error
  });

  if (error) {
    console.error('❌ Error in useShiftScheduleData:', error);
  }

  return {
    shifts,
    employees,
    branches,
    pendingSubmissions,
    loading,
    error,
    refetchShifts
  };
};