
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

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

// Helper function to safely get string value
function safeString(value: any, defaultValue: string = ''): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return String(value);
}

export const useShiftScheduleData = (businessIdParam?: string | null) => {
  const { businessId: currentBusinessId } = useCurrentBusiness();
  
  // Use the parameter if provided, otherwise use current business
  const finalBusinessId = businessIdParam || currentBusinessId;
  
  console.log('🔄 useShiftScheduleData hook initialized:', {
    businessIdParam,
    currentBusinessId,
    finalBusinessId
  });

  // Fetch shifts
  const { data: shifts = [], isLoading: shiftsLoading, error: shiftsError, refetch: refetchShifts } = useQuery({
    queryKey: ['schedule-shifts', finalBusinessId],
    queryFn: async () => {
      if (!finalBusinessId) {
        console.log('❌ No business ID available for shifts');
        return [];
      }

      console.log('🔍 Fetching shifts for business:', finalBusinessId);

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
        .eq('business_id', finalBusinessId)
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
        branch_name: shift.branch?.name ? safeString(shift.branch.name) : 'ללא סניף',
        // Ensure employee names are safely handled
        employee: shift.employee ? {
          ...shift.employee,
          first_name: safeString(shift.employee.first_name),
          last_name: safeString(shift.employee.last_name),
          phone: safeString(shift.employee.phone)
        } : null,
        // Ensure branch data is safely handled
        branch: shift.branch ? {
          ...shift.branch,
          name: safeString(shift.branch.name)
        } : null
      }));
    },
    enabled: !!finalBusinessId,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60, // 1 minute
  });

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading, error: employeesError } = useQuery({
    queryKey: ['schedule-employees', finalBusinessId],
    queryFn: async () => {
      if (!finalBusinessId) {
        console.log('❌ No business ID available for employees');
        return [];
      }

      console.log('🔍 Fetching employees for business:', finalBusinessId);

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
        .eq('business_id', finalBusinessId)
        .eq('is_active', true)
        .eq('is_archived', false)
        .order('first_name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching employees:', error);
        throw error;
      }

      console.log('✅ Fetched employees:', data?.length || 0);
      
      // Safely handle employee data
      return (data || []).map(employee => ({
        ...employee,
        first_name: safeString(employee.first_name),
        last_name: safeString(employee.last_name),
        email: safeString(employee.email),
        phone: safeString(employee.phone),
        employee_id: safeString(employee.employee_id),
        notes: safeString(employee.notes)
      }));
    },
    enabled: !!finalBusinessId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch branches
  const { data: branches = [], isLoading: branchesLoading, error: branchesError } = useQuery({
    queryKey: ['schedule-branches', finalBusinessId],
    queryFn: async () => {
      if (!finalBusinessId) {
        console.log('❌ No business ID available for branches');
        return [];
      }

      console.log('🔍 Fetching branches for business:', finalBusinessId);

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
        .eq('business_id', finalBusinessId)
        .eq('is_active', true)
        .eq('is_archived', false)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching branches:', error);
        throw error;
      }

      console.log('✅ Fetched branches:', data?.length || 0);

      // Security check: ensure all branches belong to the business
      const validBranches = (data || []).filter(branch => branch.business_id === finalBusinessId);
      if (validBranches.length !== (data || []).length) {
        console.warn('⚠️ Some branches did not belong to the business and were filtered out');
      }

      // Safely handle branch data
      return validBranches.map(branch => ({
        ...branch,
        name: safeString(branch.name),
        address: safeString(branch.address)
      }));
    },
    enabled: !!finalBusinessId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch shift submissions for display in schedule
  const { data: pendingSubmissions = [], isLoading: submissionsLoading, error: submissionsError } = useQuery({
    queryKey: ['shift-submissions', finalBusinessId],
    queryFn: async () => {
      if (!finalBusinessId) {
        console.log('❌ No business ID available for shift submissions');
        return [];
      }

      console.log('🔍 Fetching shift submissions for business:', finalBusinessId);

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
        .eq('employees.business_id', finalBusinessId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching shift submissions:', error);
        throw error;
      }

      console.log('✅ Fetched shift submissions:', data?.length || 0);
      console.log('🔍 Submission types found:', data?.map(s => ({ id: s.id, submission_type: s.submission_type })));
      
      // Safely handle submission data
      return (data || []).map(submission => ({
        ...submission,
        employees: submission.employees ? {
          ...submission.employees,
          first_name: safeString(submission.employees.first_name),
          last_name: safeString(submission.employees.last_name),
          employee_id: safeString(submission.employees.employee_id)
        } : null
      }));
    },
    enabled: !!finalBusinessId,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60, // 1 minute
  });

  const loading = shiftsLoading || employeesLoading || branchesLoading || submissionsLoading;
  const error = shiftsError || employeesError || branchesError || submissionsError;

  console.log('📊 useShiftScheduleData summary:', {
    finalBusinessId,
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
