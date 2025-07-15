
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export const useEmployeeNavigation = (currentEmployeeId: string | undefined) => {
  const { profile } = useAuth();
  const { businessId } = useCurrentBusiness();

  // Get all employees for navigation
  const { data: employees } = useQuery({
    queryKey: ['employees-navigation', businessId],
    queryFn: async () => {
      if (!businessId) {
        return [];
      }

      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('business_id', businessId)
        .eq('is_archived', false)
        .order('first_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });

  const navigation = useMemo(() => {
    if (!employees || !currentEmployeeId) {
      return { previousEmployee: null, nextEmployee: null, currentIndex: -1, total: 0 };
    }

    const currentIndex = employees.findIndex(emp => emp.id === currentEmployeeId);
    const previousEmployee = currentIndex > 0 ? employees[currentIndex - 1] : null;
    const nextEmployee = currentIndex < employees.length - 1 ? employees[currentIndex + 1] : null;

    return {
      previousEmployee,
      nextEmployee,
      currentIndex,
      total: employees.length
    };
  }, [employees, currentEmployeeId]);

  return navigation;
};
