
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// מחזיר רשימת אופציות עובדים לשימוש ב-selectים
export function useEmployeesOptions() {
  const { data } = useQuery({
    queryKey: ['employees-select-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    }
  });

  if (!data) return [];
  return data.map((emp: any) => ({
    id: emp.id,
    label: `${emp.first_name} ${emp.last_name}`
  }));
}
