
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
          is_new,
          employee:employees(first_name, last_name, business_id),
          branch:branches(name)
        `)
        .eq('business_id', businessId || '')
        .order('shift_date', { ascending: false });

      // Business ID is already filtered in the main query

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching shifts:', error);
        throw error;
      }

      const formattedData: ShiftData[] = (data || []).map(shift => ({
        id: shift.id,
        employee_id: shift.employee_id || '',
        employee_name: shift.employee 
          ? `${shift.employee.first_name || ''} ${shift.employee.last_name || ''}`.trim() 
          : 'לא משוייך',
        shift_date: shift.shift_date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        status: mapStatusToUnion(shift.status),
        branch_name: shift.branch?.name || '',
        branch_preference: shift.branch?.name || '',
        role_preference: shift.role || '',
        notes: shift.notes,
        created_at: shift.created_at,
        reviewed_at: shift.updated_at,
        reviewed_by: '',
        is_new: shift.is_new || false,
      }));

      console.log('✅ Fetched shifts:', formattedData.length);
      return formattedData;
    },
    enabled: !!businessId,
  });

  return { shifts, loading, refetch };
};
