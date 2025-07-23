
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

// Helper function to safely get string value
function safeString(value: any, defaultValue: string = ''): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return String(value);
}

export const useShiftsByDateRange = (startDate: string, endDate: string) => {
  const { businessId } = useCurrentBusiness();
  
  return useQuery({
    queryKey: ['shifts-by-date-range', businessId, startDate, endDate],
    queryFn: async () => {
      if (!businessId || !startDate || !endDate) {
        console.log('❌ Missing required parameters:', { businessId, startDate, endDate });
        return [];
      }

      console.log('🔍 Fetching shifts for date range:', { businessId, startDate, endDate });

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
          required_employees,
          shift_assignments,
          priority,
          employee:employees(id, first_name, last_name, phone, business_id),
          branch:branches(id, name, business_id)
        `)
        .eq('business_id', businessId)
        .eq('is_archived', false)
        .gte('shift_date', startDate)
        .lte('shift_date', endDate)
        .order('shift_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('❌ Error fetching shifts by date range:', error);
        throw error;
      }

      console.log('✅ Fetched shifts for date range:', {
        count: data?.length || 0,
        dateRange: `${startDate} to ${endDate}`,
        businessId
      });

      // Safely handle the data with null checks
      return (data || []).map(shift => ({
        ...shift,
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
        } : null,
        // Add safe branch_name
        branch_name: shift.branch?.name ? safeString(shift.branch.name) : 'ללא סניף',
        // Ensure other string fields are safe
        role: safeString(shift.role),
        notes: safeString(shift.notes)
      }));
    },
    enabled: !!(businessId && startDate && endDate),
    staleTime: 1000 * 60, // 1 minute
  });
};
