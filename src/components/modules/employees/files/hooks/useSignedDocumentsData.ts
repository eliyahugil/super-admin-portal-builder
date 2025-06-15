
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { SignedDocument } from '../types';

export const useSignedDocumentsData = () => {
  const { businessId } = useCurrentBusiness();

  return useQuery({
    queryKey: ['signed-documents-for-files', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      console.log('🔍 Fetching signed documents for business:', businessId);

      // שליפת מסמכים חתומים מטבלת employee_documents
      // נוודא שנשלף רק מסמכים שאכן נחתמו (יש להם digital_signature_data ו-signed_at)
      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          id,
          employee_id,
          document_name,
          document_type,
          file_url,
          signed_at,
          created_at,
          digital_signature_data,
          employee:employees!employee_documents_employee_id_fkey(
            id,
            first_name,
            last_name,
            employee_id,
            business_id
          )
        `)
        .eq('status', 'signed')
        .not('signed_at', 'is', null)
        .not('digital_signature_data', 'is', null)
        .eq('employee.business_id', businessId)
        .order('signed_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching signed documents:', error);
        return [];
      }

      console.log('✅ Fetched signed documents:', data?.length || 0);

      // המר את הנתונים לפורמט הנכון - רק מסמכים שאכן נחתמו
      return data?.filter(item => 
        item.employee && 
        item.signed_at && 
        item.digital_signature_data &&
        item.employee.business_id === businessId
      ).map(item => ({
        id: item.id,
        employee_id: item.employee_id,
        document_name: item.document_name,
        document_type: item.document_type,
        file_url: item.file_url,
        signed_at: item.signed_at!,
        created_at: item.created_at,
        digital_signature_data: item.digital_signature_data,
        employee: item.employee
      })) || [];
    },
    enabled: !!businessId,
  });
};
