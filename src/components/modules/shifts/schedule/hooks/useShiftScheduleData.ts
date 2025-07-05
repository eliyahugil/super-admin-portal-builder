
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ShiftScheduleData, EmployeeData, BranchData } from '../types';

export const useShiftScheduleData = (businessId: string | null) => {
  // Fetch shifts from scheduled_shifts table
  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ['schedule-shifts', businessId],
    queryFn: async (): Promise<ShiftScheduleData[]> => {
      console.log('🔍 Fetching shifts for business:', businessId);
      
      let query = supabase
        .from('scheduled_shifts')
        .select(`
          *,
          employee:employees(first_name, last_name, business_id),
          branch:branches(name)
        `)
        .eq('is_archived', false)
        .order('shift_date', { ascending: true });

      if (businessId) {
        const { data: businessEmployees } = await supabase
          .from('employees')
          .select('id')
          .eq('business_id', businessId);
          
        const employeeIds = businessEmployees?.map(emp => emp.id) || [];
        
        if (employeeIds.length > 0) {
          query = query.or(`employee_id.in.(${employeeIds.join(',')}),employee_id.is.null`);
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error('❌ Error fetching shifts:', error);
        throw error;
      }

      console.log('✅ Fetched shifts:', data?.length || 0);

      return (data || []).map(shift => ({
        id: shift.id,
        employee_id: shift.employee_id || '',
        shift_date: shift.shift_date,
        start_time: '09:00',
        end_time: '17:00',
        status: shift.is_assigned ? 'approved' : 'pending',
        branch_id: shift.branch_id || '',
        branch_name: shift.branch?.name || 'לא צוין',
        role_preference: '',
        notes: shift.notes || '',
        created_at: shift.created_at
      }));
    },
    enabled: !!businessId
  });

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['schedule-employees', businessId],
    queryFn: async (): Promise<EmployeeData[]> => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, phone, email')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId
  });

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ['schedule-branches', businessId],
    queryFn: async (): Promise<BranchData[]> => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, address')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId
  });

  return {
    shifts,
    employees,
    branches,
    loading: shiftsLoading
  };
};
