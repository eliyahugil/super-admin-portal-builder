import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type ShiftStatus = "pending" | "approved" | "rejected" | "completed";

function parseStatus(status: string | null): ShiftStatus {
  if (status === "pending" || status === "approved" || status === "rejected" || status === "completed") {
    return status;
  }
  return "pending"; // Default fallback
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
          weekly_hours_required,
          notes,
          created_at,
          updated_at
        `)
        .eq('business_id', businessId)
        .eq('is_active', true)
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

  // Fetch pending submissions - now returns empty array since submissions system was removed
  const { data: pendingSubmissions = [], isLoading: submissionsLoading, error: submissionsError } = useQuery({
    queryKey: ['pending-submissions', businessId],
    queryFn: async () => {
      // Shift submissions system removed - return empty array
      console.log('🔍 Pending submissions system removed - returning empty array');
      return [];
    },
    enabled: !!businessId,
    refetchOnWindowFocus: false,
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