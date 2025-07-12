
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ShiftScheduleData, Employee, Branch } from '../types';

// Helper function to validate and parse status
const allowedStatuses = ["pending", "approved", "rejected", "completed"] as const;
type ShiftStatus = typeof allowedStatuses[number];

function parseStatus(status: string | null): ShiftStatus {
  if (status && allowedStatuses.includes(status as ShiftStatus)) {
    return status as ShiftStatus;
  }
  return "pending"; // Default status if invalid or null
}

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
            shift_template_id,
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

        const transformedShifts: ShiftScheduleData[] = (data || []).map(shift => {
          const validatedStatus = parseStatus(shift.status);

          return {
            id: shift.id,
            business_id: shift.business_id,
            employee_id: shift.employee_id || '',
            shift_date: shift.shift_date,
            start_time: shift.start_time || '09:00',
            end_time: shift.end_time || '17:00',
            role: shift.role || '',
            notes: shift.notes || '',
            status: validatedStatus,
            created_at: shift.created_at,
            updated_at: shift.updated_at || shift.created_at,
            is_assigned: shift.is_assigned,
            is_archived: shift.is_archived,
            shift_template_id: shift.shift_template_id || undefined,
            branch_id: shift.branch_id || '',
            branch_name: shift.branch?.name || 'לא צוין',
            role_preference: shift.role || ''
          };
        });

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
    queryFn: async (): Promise<Employee[]> => {
      if (!businessId) {
        console.log('❌ No business ID for employees');
        return [];
      }

      console.log('🔍 Fetching employees for business:', businessId);

      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id, first_name, last_name, phone, email, business_id, employee_id, is_active')
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
    queryFn: async (): Promise<Branch[]> => {
      if (!businessId) {
        console.log('❌ No business ID for branches');
        return [];
      }

      console.log('🔍 Fetching branches for business:', businessId);

      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id, name, address, business_id, is_active')
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
