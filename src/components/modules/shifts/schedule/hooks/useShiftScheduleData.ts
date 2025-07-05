
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ShiftScheduleData, EmployeeData, BranchData } from '../types';

export const useShiftScheduleData = (businessId: string | null) => {
  console.log('🔍 useShiftScheduleData initialized with businessId:', businessId);

  // Fetch shifts from scheduled_shifts table with business filtering
  const { data: shifts = [], isLoading: shiftsLoading, error: shiftsError } = useQuery({
    queryKey: ['schedule-shifts', businessId],
    queryFn: async (): Promise<ShiftScheduleData[]> => {
      console.log('🔍 Fetching shifts for business:', businessId);
      
      if (!businessId) {
        console.log('❌ No business ID provided');
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('scheduled_shifts')
          .select(`
            id,
            shift_date,
            employee_id,
            branch_id,
            notes,
            is_assigned,
            is_archived,
            created_at,
            business_id,
            employee:employees(first_name, last_name, business_id),
            branch:branches(name, business_id)
          `)
          .eq('business_id', businessId)
          .eq('is_archived', false)
          .order('shift_date', { ascending: true });

        if (error) {
          console.error('❌ Error fetching shifts:', error);
          throw error;
        }

        console.log('✅ Raw shifts data:', data);

        const transformedShifts = (data || []).map(shift => ({
          id: shift.id,
          employee_id: shift.employee_id || '',
          shift_date: shift.shift_date,
          start_time: '09:00', // Default time - this should come from shift templates later
          end_time: '17:00', // Default time - this should come from shift templates later
          status: shift.is_assigned ? 'approved' : 'pending',
          branch_id: shift.branch_id || '',
          branch_name: shift.branch?.name || 'לא צוין',
          role_preference: '',
          notes: shift.notes || '',
          created_at: shift.created_at
        }));

        console.log('✅ Transformed shifts:', transformedShifts.length, 'shifts');
        return transformedShifts;
      } catch (error) {
        console.error('💥 Exception in shifts fetch:', error);
        throw error;
      }
    },
    enabled: !!businessId,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch employees - only from current business
  const { data: employees = [], isLoading: employeesLoading, error: employeesError } = useQuery({
    queryKey: ['schedule-employees', businessId],
    queryFn: async (): Promise<EmployeeData[]> => {
      if (!businessId) {
        console.log('❌ No business ID for employees');
        return [];
      }

      console.log('🔍 Fetching employees for business:', businessId);

      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id, first_name, last_name, phone, email, business_id')
          .eq('business_id', businessId)
          .eq('is_active', true);

        if (error) {
          console.error('❌ Error fetching employees:', error);
          throw error;
        }

        console.log('✅ Fetched employees:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('💥 Exception in employees fetch:', error);
        throw error;
      }
    },
    enabled: !!businessId,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch branches - only from current business with security check
  const { data: branches = [], isLoading: branchesLoading, error: branchesError } = useQuery({
    queryKey: ['schedule-branches', businessId],
    queryFn: async (): Promise<BranchData[]> => {
      if (!businessId) {
        console.log('❌ No business ID for branches');
        return [];
      }

      console.log('🔍 Fetching branches for business:', businessId);

      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id, name, address, business_id')
          .eq('business_id', businessId)
          .eq('is_active', true);

        if (error) {
          console.error('❌ Error fetching branches:', error);
          throw error;
        }

        // Additional security check - verify all branches belong to the business
        const validBranches = (data || []).filter(branch => branch.business_id === businessId);
        
        if (validBranches.length !== (data || []).length) {
          console.warn('⚠️ Security issue detected: Some branches did not belong to business');
        }

        console.log('✅ Fetched branches:', validBranches.length);
        return validBranches;
      } catch (error) {
        console.error('💥 Exception in branches fetch:', error);
        throw error;
      }
    },
    enabled: !!businessId,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Log any errors
  if (shiftsError) console.error('Shifts Error:', shiftsError);
  if (employeesError) console.error('Employees Error:', employeesError);
  if (branchesError) console.error('Branches Error:', branchesError);

  const loading = shiftsLoading || employeesLoading || branchesLoading;
  const hasError = shiftsError || employeesError || branchesError;

  console.log('📊 useShiftScheduleData summary:', {
    businessId,
    shiftsCount: shifts.length,
    employeesCount: employees.length,
    branchesCount: branches.length,
    loading,
    hasError: !!hasError
  });

  return {
    shifts,
    employees,
    branches,
    loading,
    error: hasError ? (shiftsError || employeesError || branchesError) : null
  };
};
