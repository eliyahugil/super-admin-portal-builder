
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Employee, ExistingSignature } from './types';

export const useSignatureData = (documentId: string) => {
  // שליפת רשימת עובדים פעילים
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['active-employees-for-signature'],
    queryFn: async (): Promise<Employee[]> => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id, email, phone')
        .eq('is_active', true)
        .order('first_name', { ascending: true });
      
      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }
      return data || [];
    },
  });

  // שליפת חתימות קיימות למסמך
  const { data: existingSignatures } = useQuery({
    queryKey: ['document-signatures', documentId],
    queryFn: async (): Promise<ExistingSignature[]> => {
      if (!documentId) return [];
      
      const { data, error } = await supabase
        .from('employee_document_signatures')
        .select(`
          *,
          employee:employees!employee_document_signatures_employee_id_fkey(
            id, first_name, last_name, employee_id
          )
        `)
        .eq('document_id', documentId);
      
      if (error) {
        console.error('Error fetching existing signatures:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!documentId,
  });

  return {
    employees: employees || [],
    employeesLoading,
    existingSignatures: existingSignatures || [],
  };
};
