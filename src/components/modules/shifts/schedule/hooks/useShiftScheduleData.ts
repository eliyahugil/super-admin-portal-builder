
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ShiftScheduleData, EmployeeData, BranchData } from '../types';

export const useShiftScheduleData = (businessId: string | null) => {
  // Fetch shifts from scheduled_shifts table with business filtering
  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ['schedule-shifts', businessId],
    queryFn: async (): Promise<ShiftScheduleData[]> => {
      console.log('🔍 Fetching shifts for business:', businessId);
      
      if (!businessId) {
        console.log('❌ No business ID provided');
        return [];
      }

      const { data, error } = await supabase
        .from('scheduled_shifts')
        .select(`
          *,
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

  // Fetch employees - only from current business
  const { data: employees = [] } = useQuery({
    queryKey: ['schedule-employees', businessId],
    queryFn: async (): Promise<EmployeeData[]> => {
      if (!businessId) {
        console.log('❌ No business ID for employees');
        return [];
      }

      console.log('🔍 Fetching employees for business:', businessId);

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
    },
    enabled: !!businessId
  });

  // Fetch branches - only from current business with security check
  const { data: branches = [] } = useQuery({
    queryKey: ['schedule-branches', businessId],
    queryFn: async (): Promise<BranchData[]> => {
      if (!businessId) {
        console.log('❌ No business ID for branches');
        return [];
      }

      console.log('🔍 Fetching branches for business:', businessId);

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
