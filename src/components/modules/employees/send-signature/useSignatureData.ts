
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import type { Employee, ExistingSignature } from './types';

export const useSignatureData = (documentId: string) => {
  const { profile } = useAuth();

  // שליפת רשימת עובדים פעילים של העסק הנוכחי
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['active-employees-for-signature', profile?.business_id, profile?.role],
    queryFn: async (): Promise<Employee[]> => {
      // עבור super_admin, נשתמש בעסק הראשון כברירת מחדל אם אין business_id
      // עבור משתמשים רגילים, נשתמש ב-business_id שלהם
      let targetBusinessId = profile?.business_id;
      
      if (profile?.role === 'super_admin' && !targetBusinessId) {
        // אם super_admin ללא עסק מוקצה, נשתמש בעסק הראשון
        const { data: businesses } = await supabase
          .from('businesses')
          .select('id')
          .eq('is_active', true)
          .limit(1);
        
        if (businesses && businesses.length > 0) {
          targetBusinessId = businesses[0].id;
        }
      }

      if (!targetBusinessId) {
        console.log('❌ No business_id available, cannot fetch employees');
        return [];
      }

      const query = supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id, email, phone, business_id')
        .eq('is_active', true)
        .eq('business_id', targetBusinessId)
        .order('first_name', { ascending: true });

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
