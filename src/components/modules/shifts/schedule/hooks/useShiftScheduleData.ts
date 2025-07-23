
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEmployeeContext } from '@/hooks/useEmployeeContext';
import { useEmployeeShiftsData } from '@/hooks/useEmployeeShiftsData';
import type { ShiftScheduleData, Employee, Branch, PendingSubmission } from '../types';

export const useShiftScheduleData = (businessId: string | null) => {
  const { isEmployee, employeeId, assignedBranchIds } = useEmployeeContext();

  // For employees, use the specialized employee shifts hook
  const { data: employeeShifts, isLoading: employeeShiftsLoading, error: employeeShiftsError, refetch: refetchEmployeeShifts } = useEmployeeShiftsData();

  // Regular shifts query for business admins
  const { data: adminShifts, isLoading: adminShiftsLoading, error: adminShiftsError, refetch: refetchAdminShifts } = useQuery({
    queryKey: ['shift-schedule-data', businessId],
    queryFn: async (): Promise<ShiftScheduleData[]> => {
      if (!businessId) return [];

      console.log('📊 Fetching shift schedule data for business:', businessId);

      const { data, error } = await supabase
        .from('scheduled_shifts')
        .select(`
          *,
          branches:branch_id(id, name, address),
          employees:employee_id(id, first_name, last_name, employee_id)
        `)
        .eq('business_id', businessId)
        .order('shift_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('❌ Error fetching shift schedule data:', error);
        throw error;
      }

      console.log('✅ Shift schedule data fetched:', data?.length || 0);
      return (data || []) as ShiftScheduleData[];
    },
    enabled: !isEmployee && !!businessId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Employees query - filter only employees in assigned branches
  const { data: employees, isLoading: employeesLoading, error: employeesError } = useQuery({
    queryKey: ['employees', businessId, isEmployee, assignedBranchIds],
    queryFn: async (): Promise<Employee[]> => {
      if (!businessId) return [];

      console.log('👥 Fetching employees for business:', businessId);

      let query = supabase
        .from('employees')
        .select(`
          *,
          main_branch:main_branch_id(id, name, address),
          employee_branch_assignments!inner(
            id,
            branch_id,
            role_name,
            priority_order,
            is_active,
            branch:branches(name)
          )
        `)
        .eq('business_id', businessId)
        .eq('is_active', true)
        .eq('is_archived', false);

      // CRITICAL: If employee, only show employees from assigned branches
      if (isEmployee && assignedBranchIds.length > 0) {
        console.log('🔒 Employee view - filtering employees by branch assignments:', assignedBranchIds);
        query = query.in('employee_branch_assignments.branch_id', assignedBranchIds);
      }

      query = query.order('first_name', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching employees:', error);
        throw error;
      }

      console.log('✅ Employees fetched:', {
        count: data?.length || 0,
        isEmployee,
        filteredByBranches: isEmployee && assignedBranchIds.length > 0
      });

      return (data || []) as Employee[];
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Branches query - handled by useBranchesData which is already updated
  const { data: branches, isLoading: branchesLoading, error: branchesError } = useQuery({
    queryKey: ['branches-schedule', businessId, isEmployee, assignedBranchIds],
    queryFn: async (): Promise<Branch[]> => {
      if (!businessId) return [];

      let query = supabase
        .from('branches')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);

      // CRITICAL: Filter branches for employees
      if (isEmployee && assignedBranchIds.length > 0) {
        console.log('🔒 Employee view - filtering branches:', assignedBranchIds);
        query = query.in('id', assignedBranchIds);
      }

      query = query.order('name', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching branches:', error);
        throw error;
      }

      console.log('✅ Branches fetched for schedule:', {
        count: data?.length || 0,
        isEmployee,
        filteredByAssignments: isEmployee && assignedBranchIds.length > 0
      });

      return (data || []) as Branch[];
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Pending submissions - only for admins
  const { data: pendingSubmissions, isLoading: pendingLoading, error: pendingError } = useQuery({
    queryKey: ['pending-submissions', businessId],
    queryFn: async (): Promise<PendingSubmission[]> => {
      if (!businessId || isEmployee) return [];

      const { data, error } = await supabase
        .from('public_shift_submissions')
        .select(`
          *,
          employees(id, first_name, last_name, employee_id, business_id, phone, employee_type, weekly_hours_required)
        `)
        .eq('business_id', businessId)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching pending submissions:', error);
        throw error;
      }

      return (data || []) as PendingSubmission[];
    },
    enabled: !isEmployee && !!businessId,
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });

  // Determine which data to use based on user type
  const shifts = isEmployee ? (employeeShifts || []) : (adminShifts || []);
  const loading = isEmployee ? employeeShiftsLoading : (adminShiftsLoading || employeesLoading || branchesLoading || pendingLoading);
  const error = isEmployee ? employeeShiftsError : (adminShiftsError || employeesError || branchesError || pendingError);
  const refetchShifts = isEmployee ? refetchEmployeeShifts : refetchAdminShifts;

  console.log('📊 useShiftScheduleData summary:', {
    isEmployee,
    employeeId,
    assignedBranchIds,
    shiftsCount: shifts.length,
    employeesCount: employees?.length || 0,
    branchesCount: branches?.length || 0,
    pendingCount: pendingSubmissions?.length || 0,
    loading,
    hasError: !!error
  });

  return {
    shifts: shifts as ShiftScheduleData[],
    employees: employees || [],
    branches: branches || [],
    pendingSubmissions: pendingSubmissions || [],
    loading,
    error,
    refetchShifts
  };
};
