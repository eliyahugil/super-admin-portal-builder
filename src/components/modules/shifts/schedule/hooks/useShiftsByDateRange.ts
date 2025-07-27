
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useEmployeeContext } from '@/hooks/useEmployeeContext';
import type { ShiftScheduleData, ShiftAssignment } from '../types';

// Helper function to safely parse shift assignments
const parseShiftAssignments = (assignments: any): ShiftAssignment[] => {
  if (!assignments) return [];
  
  try {
    const parsed = Array.isArray(assignments) ? assignments : JSON.parse(assignments);
    return parsed.map((assignment: any) => ({
      id: assignment.id || '',
      type: assignment.type || 'חובה',
      employee_id: assignment.employee_id || null,
      position: assignment.position || 1,
      is_required: assignment.is_required || false
    }));
  } catch (error) {
    console.warn('Failed to parse shift assignments:', error);
    return [];
  }
};

export const useShiftsByDateRange = (startDate: string, endDate: string) => {
  const { businessId } = useCurrentBusiness();
  const { isEmployee, employeeId, assignedBranchIds } = useEmployeeContext();

  return useQuery({
    queryKey: ['shifts-by-date-range', businessId, startDate, endDate, isEmployee, employeeId],
    queryFn: async (): Promise<ShiftScheduleData[]> => {
      if (!businessId) return [];

      console.log('📊 Fetching shifts for date range:', {
        startDate,
        endDate,
        businessId,
        isEmployee,
        employeeId
      });

      let query = supabase
        .from('scheduled_shifts')
        .select(`
          *,
          branches:branch_id(id, name, address),
          employees:employee_id(id, first_name, last_name, employee_id)
        `)
        .eq('business_id', businessId)
        .gte('shift_date', startDate)
        .lte('shift_date', endDate);

      // Apply employee-specific filtering if needed
      if (isEmployee && employeeId && assignedBranchIds.length > 0) {
        query = query.or(
          `employee_id.eq.${employeeId},and(employee_id.is.null,branch_id.in.(${assignedBranchIds.join(',')}))`
        );
      } else if (isEmployee && employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      query = query.order('shift_date', { ascending: true })
                  .order('start_time', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching shifts by date range:', error);
        throw error;
      }

      // Transform data to match our interface
      const transformedData: ShiftScheduleData[] = (data || []).map(shift => ({
        id: shift.id,
        business_id: shift.business_id,
        shift_date: shift.shift_date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        employee_id: shift.employee_id,
        branch_id: shift.branch_id,
        role: shift.role,
        notes: shift.notes,
        status: shift.status as 'pending' | 'approved' | 'rejected' | 'completed' | 'assigned',
        shift_template_id: shift.shift_template_id,
        is_assigned: shift.is_assigned,
        is_archived: shift.is_archived || false,
        required_employees: shift.required_employees,
        priority: shift.priority as 'critical' | 'normal' | 'backup' | undefined,
        shift_assignments: parseShiftAssignments(shift.shift_assignments),
        created_at: shift.created_at,
        updated_at: shift.updated_at,
        is_new: shift.is_new
      }));

      console.log('✅ Shifts by date range fetched:', transformedData.length);
      return transformedData;
    },
    enabled: !!businessId && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
