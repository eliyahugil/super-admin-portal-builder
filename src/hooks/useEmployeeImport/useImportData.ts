
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useImportData = (
  businessId: string | null,
  setBranches: (branches: any[]) => void,
  setExistingEmployees: (employees: any[]) => void
) => {
  const fetchBranches = async () => {
    if (!businessId) return;
    
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true);
    
    if (!error && data) {
      setBranches(data);
    }
  };

  const fetchExistingEmployees = async () => {
    if (!businessId) return;
    
    const { data, error } = await supabase
      .from('employees')
      .select('email, phone, id_number, employee_id')
      .eq('business_id', businessId);
    
    if (!error && data) {
      setExistingEmployees(data);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchBranches();
      fetchExistingEmployees();
    }
  }, [businessId]);

  return { fetchBranches, fetchExistingEmployees };
};
