
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

      // שלוף מסמכים חתומים מטבלת employee_document_signatures
      const { data, error } = await supabase
        .from('employee_document_signatures')
        .select(`
          id,
          employee_id,
          signed_at,
          created_at,
          digital_signature_data,
          employee:employees!employee_document_signatures_employee_id_fkey(
            id,
            first_name,
            last_name,
            employee_id,
            business_id
          ),
          document:employee_documents!employee_document_signatures_document_id_fkey(
            id,
            document_name,
            document_type,
            file_url
          )
        `)
        .eq('status', 'signed')
        .not('signed_at', 'is', null)
        .eq('employee.business_id', businessId)
        .order('signed_at', { ascending: false });

      if (error) {
        console.error('Error fetching signed documents:', error);
        return [];
      }

      // המר את הנתונים לפורמט הנכון
      return data?.filter(item => item.employee && item.document).map(item => ({
        id: item.id,
        employee_id: item.employee_id,
        document_name: item.document.document_name,
        document_type: item.document.document_type,
        file_url: item.document.file_url,
        signed_at: item.signed_at,
        created_at: item.created_at,
        digital_signature_data: item.digital_signature_data,
        employee: item.employee
      })) || [];
    },
    enabled: !!businessId,
  });
};
