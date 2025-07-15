
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import type { Employee, ExistingSignature } from './types';

export const useSignatureData = (documentId: string) => {
  const { profile } = useAuth();

  // שליפת רשימת עובדים פעילים של העסק הנוכחי (או כל העובדים עבור super_admin)
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['active-employees-for-signature', profile?.business_id, profile?.role],
    queryFn: async (): Promise<Employee[]> => {
      let query = supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id, email, phone, business_id')
        .eq('is_active', true)
        .order('first_name', { ascending: true });

      // אם המשתמש הוא super_admin, הוא רואה את כל העובדים
      // אחרת, הוא רואה רק עובדים של העסק שלו
      if (profile?.role !== 'super_admin') {
        if (!profile?.business_id) {
          console.log('❌ No business_id in profile and not super_admin, cannot fetch employees');
          return [];
        }
        query = query.eq('business_id', profile.business_id);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }
      
      console.log(`✅ Fetched ${data?.length || 0} employees for ${profile?.role === 'super_admin' ? 'super_admin (all businesses)' : `business ${profile?.business_id}`}`);
      return data || [];
    },
    enabled: !!(profile?.role === 'super_admin' || profile?.business_id),
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
