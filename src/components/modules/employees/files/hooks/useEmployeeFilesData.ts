
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { EmployeeFile } from '../types';

export const useEmployeeFilesData = (searchTerm: string, dateFilter: string, fileTypeFilter: string) => {
  const { businessId } = useCurrentBusiness();

  return useQuery({
    queryKey: ['employee-files-management', businessId, searchTerm, dateFilter, fileTypeFilter],
    queryFn: async () => {
      if (!businessId) return [];

      let query = supabase
        .from('employee_files')
        .select(`
          *,
          employee:employees(
            id,
            first_name,
            last_name,
            employee_id
          )
        `)
        .eq('business_id', businessId)
        .order('uploaded_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });
};
