
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export interface Employee {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  employee_type: 'permanent' | 'temporary' | 'contractor' | 'youth';
  hire_date?: string;
  termination_date?: string;
  weekly_hours_required?: number;
  notes?: string;
  employee_id?: string;
  id_number?: string;
  is_active: boolean;
  is_archived: boolean;
  is_system_user: boolean;
  main_branch_id?: string;
  created_at: string;
  updated_at: string;
}

export const useEmployees = (selectedBusinessId?: string | null) => {
  const { businessId: contextBusinessId } = useCurrentBusiness();
  const effectiveBusinessId = selectedBusinessId || contextBusinessId;

  return useQuery({
    queryKey: ['employees', effectiveBusinessId],
    queryFn: async (): Promise<Employee[]> => {
      if (!effectiveBusinessId) {
        console.log('❌ No business ID available for employees');
        return [];
      }

      console.log('👥 Fetching ACTIVE employees for business:', effectiveBusinessId);

      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          business_id,
          first_name,
          last_name,
          email,
          phone,
          address,
          employee_type,
          hire_date,
          termination_date,
          weekly_hours_required,
          notes,
          employee_id,
          id_number,
          is_active,
          is_archived,
          is_system_user,
          main_branch_id,
          created_at,
          updated_at
        `)
        .eq('business_id', effectiveBusinessId)
        .eq('is_archived', false)  // רק עובדים לא ארכיוניים
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching employees:', error);
        throw error;
      }

      console.log('✅ Active employees fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!effectiveBusinessId,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
