
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import type { Employee, ExistingSignature } from './types';

export const useSignatureData = (documentId: string) => {
  const { profile } = useAuth();

  // שליפת רשימת עובדים פעילים של העסק הנוכחי
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['active-employees-for-signature', profile?.business_id],
    queryFn: async (): Promise<Employee[]> => {
      if (!profile?.business_id) {
        console.log('❌ No business_id in profile, cannot fetch employees');
        return [];
      }

      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id, email, phone, business_id')
        .eq('is_active', true)
        .eq('business_id', profile.business_id)
        .order('first_name', { ascending: true });
      
      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }
      
      console.log(`✅ Fetched ${data?.length || 0} employees for business ${profile.business_id}`);
      return data || [];
    },
    enabled: !!profile?.business_id,
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
            id, first_name, last_name, employee_id, business_id
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
