import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface EmployeeOption {
  id: string;
  label: string;
}

export const useEmployeesOptions = (): EmployeeOption[] => {
  const { businessId } = useCurrentBusiness();

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-options', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('first_name');

      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!businessId,
  });

  return employees.map(employee => ({
    id: employee.id,
    label: `${employee.first_name} ${employee.last_name}${employee.email ? ` (${employee.email})` : ''}`
  }));
};