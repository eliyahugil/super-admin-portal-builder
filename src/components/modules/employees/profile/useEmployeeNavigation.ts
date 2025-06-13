
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export const useEmployeeNavigation = (currentEmployeeId: string | undefined) => {
  const { profile } = useAuth();

  // Get all employees for navigation
  const { data: employees } = useQuery({
    queryKey: ['employees-navigation', profile?.business_id, profile?.role],
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select('id, first_name, last_name')
        .order('first_name', { ascending: true });

      // Apply business filter based on user type
      if (profile?.role !== 'super_admin' && profile?.business_id) {
        query = query.eq('business_id', profile.business_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile,
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
