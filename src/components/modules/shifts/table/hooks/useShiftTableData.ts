
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ShiftData } from '../types';

// Helper function to map status strings to the correct union type
const mapStatusToUnion = (status: string): 'pending' | 'approved' | 'rejected' | 'completed' => {
  switch (status) {
    case 'pending':
    case 'approved':
    case 'rejected':
    case 'completed':
      return status as 'pending' | 'approved' | 'rejected' | 'completed';
    default:
      return 'pending'; // Default fallback
  }
};

export const useShiftTableData = (businessId?: string) => {
  console.log('🔄 useShiftTableData initializing with businessId:', businessId);

  // Fetch shifts data
  const { data: shifts = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['shifts-table', businessId],
    queryFn: async (): Promise<ShiftData[]> => {
      console.log('📊 Fetching shifts for business:', businessId);
      
      let query = supabase
        .from('employee_shift_requests')
        .select(`
          *,
          employee:employees(first_name, last_name, business_id)
        `)
        .order('shift_date', { ascending: false });

      if (businessId) {
        query = query.eq('employee.business_id', businessId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching shifts:', error);
        throw error;
      }

      const formattedData: ShiftData[] = (data || []).map(shift => ({
        id: shift.id,
        employee_id: shift.employee_id,
        employee_name: `${shift.employee?.first_name || ''} ${shift.employee?.last_name || ''}`.trim(),
        shift_date: shift.shift_date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        status: mapStatusToUnion(shift.status),
        branch_name: shift.branch_preference,
        branch_preference: shift.branch_preference,
        role_preference: shift.role_preference,
        notes: shift.notes,
        created_at: shift.created_at,
        reviewed_at: shift.reviewed_at,
        reviewed_by: shift.reviewed_by,
      }));

      console.log('✅ Fetched shifts:', formattedData.length);
      return formattedData;
    },
    enabled: !!businessId,
  });

  return { shifts, loading, refetch };
};
