
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useImportData = (
  businessId: string | null,
  setBranches: (branches: any[]) => void,
  setExistingEmployees: (employees: any[]) => void
) => {
  // Fetch branches for the business
  const { data: branches } = useQuery({
    queryKey: ['branches', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .eq('business_id', businessId)
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching branches:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!businessId,
  });

  // Fetch existing employees for duplicate checking
  const { data: existingEmployees } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('employees')
        .select('email, phone, id_number, employee_id, first_name, last_name')
        .eq('business_id', businessId);
      
      if (error) {
        console.error('Error fetching existing employees:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!businessId,
  });

  // Update state when data changes
  useEffect(() => {
    if (branches) {
      setBranches(branches);
    }
  }, [branches, setBranches]);

  useEffect(() => {
    if (existingEmployees) {
      setExistingEmployees(existingEmployees);
    }
  }, [existingEmployees, setExistingEmployees]);
};
