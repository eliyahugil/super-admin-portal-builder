
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
  const { data: shifts = [], isLoading: shiftsLoading, error: shiftsError, refetch: refetchShifts } = useQuery({
    queryKey: ['schedule-shifts', businessId],
    queryFn: async (): Promise<ShiftScheduleData[]> => {
      console.log('🔍 Fetching shifts for business:', businessId);
      console.log('🔍 Query timestamp:', new Date().toISOString());
      
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
            required_employees,
            priority,
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
            role_preference: shift.role || '',
            required_employees: shift.required_employees || 1,
            priority: (shift.priority as 'critical' | 'normal' | 'backup') || 'normal'
          };
        });

        console.log('✅ Shifts loaded successfully:', {
          count: data.length,
          shifts: data.map(s => ({
            id: s.id,
            date: s.shift_date,
            time: `${s.start_time}-${s.end_time}`,
            branch: s.branch?.name,
            employee: s.employee ? `${s.employee.first_name} ${s.employee.last_name}` : 'ללא עובד'
          }))
        });
        
        return transformedShifts;
      } catch (error) {
        console.error('💥 Exception in shifts fetch:', error);
        throw error;
      }
    },
    enabled: !!businessId,
    staleTime: 0, // תמיד יביא נתונים חדשים
    refetchOnMount: true,
    refetchOnWindowFocus: true
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

  // Fetch pending shift submissions
  const { data: pendingSubmissions = [], isLoading: submissionsLoading, error: submissionsError } = useQuery({
    queryKey: ['pending-submissions', businessId],
    queryFn: async () => {
      if (!businessId) {
        console.log('❌ No business ID for submissions');
        return [];
      }

      console.log('🔍 Fetching pending submissions for business:', businessId);

      try {
        const { data, error } = await supabase
          .from('shift_submissions')
          .select(`
            id,
            employee_id,
            shifts,
            status,
            submitted_at,
            week_start_date,
            week_end_date,
            employee:employees!inner(first_name, last_name, business_id)
          `)
          .in('status', ['pending', 'submitted'])
          .eq('employee.business_id', businessId);

        if (error) {
          console.error('❌ Error fetching pending submissions:', error);
          throw error;
        }

        console.log('✅ Fetched pending submissions:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('💥 Exception in submissions fetch:', error);
        throw error;
      }
    },
    enabled: !!businessId,
    retry: 1,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Log any errors
  if (shiftsError) console.error('Shifts Error:', shiftsError);
  if (employeesError) console.error('Employees Error:', employeesError);
  if (branchesError) console.error('Branches Error:', branchesError);
  if (submissionsError) console.error('Submissions Error:', submissionsError);

  const loading = shiftsLoading || employeesLoading || branchesLoading || submissionsLoading;
  const hasError = shiftsError || employeesError || branchesError || submissionsError;

  console.log('📊 useShiftScheduleData summary:', {
    businessId,
    shiftsCount: shifts.length,
    employeesCount: employees.length,
    branchesCount: branches.length,
    pendingSubmissionsCount: pendingSubmissions.length,
    loading,
    hasError: !!hasError
  });

  return {
    shifts,
    employees,
    branches,
    pendingSubmissions,
    loading,
    error: hasError ? (shiftsError || employeesError || branchesError || submissionsError) : null,
    refetchShifts
  };
};
