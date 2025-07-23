
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEmployeeContext } from '@/hooks/useEmployeeContext';

export const useEmployeeShiftsData = (weekStartDate?: string, weekEndDate?: string) => {
  const { isEmployee, employeeId, businessId, assignedBranchIds } = useEmployeeContext();

  return useQuery({
    queryKey: ['employee-shifts', employeeId, businessId, weekStartDate, weekEndDate],
    queryFn: async () => {
      if (!isEmployee || !employeeId || !businessId) {
        console.log('❌ Not employee context or missing required data');
        return [];
      }

      console.log('🔍 Fetching shifts for employee:', {
        employeeId,
        businessId,
        assignedBranchIds,
        weekStartDate,
        weekEndDate
      });

      let query = supabase
        .from('scheduled_shifts')
        .select(`
          *,
          branches:branch_id(id, name, address),
          employees:employee_id(id, first_name, last_name, employee_id)
        `)
        .eq('business_id', businessId);

      // Filter by date range if provided
      if (weekStartDate && weekEndDate) {
        query = query
          .gte('shift_date', weekStartDate)
          .lte('shift_date', weekEndDate);
      }

      // CRITICAL: Filter shifts to only show:
      // 1. Shifts assigned to this employee
      // 2. Unassigned shifts in branches the employee is assigned to
      if (assignedBranchIds.length > 0) {
        query = query.or(
          `employee_id.eq.${employeeId},and(employee_id.is.null,branch_id.in.(${assignedBranchIds.join(',')}))`
        );
      } else {
        // If no branch assignments, only show shifts assigned to this employee
        query = query.eq('employee_id', employeeId);
      }

      query = query.order('shift_date', { ascending: true })
                  .order('start_time', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching employee shifts:', error);
        throw error;
      }

      console.log('✅ Employee shifts fetched:', {
        count: data?.length || 0,
        employeeId,
        assignedBranchIds
      });

      return data || [];
    },
    enabled: isEmployee && !!employeeId && !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
