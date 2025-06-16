
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useSignDocument = (documentId: string) => {
  const [isSigning, setIsSigning] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // שליפת פרטי המסמך
  const { data: document, isLoading, error, refetch } = useQuery({
    queryKey: ['document-for-signature', documentId],
    queryFn: async () => {
      if (!documentId) return null;
      
      console.log('📄 Fetching document for signature:', documentId);
      
      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          *,
          employee:employees!employee_documents_employee_id_fkey(
            id, first_name, last_name, employee_id
          ),
          signatures:employee_document_signatures(
            id,
            employee_id,
            status,
            signed_at,
            sent_at,
            employee:employees!employee_document_signatures_employee_id_fkey(
              id,
              first_name,
              last_name,
              employee_id
            )
          )
        `)
        .eq('id', documentId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching document:', error);
        throw error;
      }
      
      console.log('✅ Document fetched:', data);
      return data;
    },
    enabled: !!documentId,
  });

  const handleSign = async (signatureImageData: string) => {
    if (!documentId || !signatureImageData) {
      toast({
        title: 'שגיאה',
        description: 'נתונים חסרים לחתימה',
        variant: 'destructive',
      });
      return;
    }

    setIsSigning(true);
    console.log('🖋️ Starting signature process for document:', documentId);

    try {
      // עדכון המסמך עם החתימה
      const signatureData = {
        signature_image: signatureImageData,
        signed_by: document?.employee ? `${document.employee.first_name} ${document.employee.last_name}` : 'עובד',
        timestamp: new Date().toISOString(),
      };

      console.log('💾 Updating document with signature data');

      const { error: updateError } = await supabase
        .from('employee_documents')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString(),
          digital_signature_data: signatureData,
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('❌ Error updating document:', updateError);
        throw updateError;
      }

      console.log('✅ Document signed successfully');
      
      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ['document-for-signature', documentId] });
      await queryClient.invalidateQueries({ queryKey: ['signed-documents-for-files'] });
      await queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
      
      // Refetch current document
      await refetch();
      
      toast({
        title: 'הצלחה',
        description: 'המסמך נחתם בהצלחה!',
      });
      
    } catch (error: any) {
      console.error('❌ Error signing document:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לחתום על המסמך. נסה שנית.',
        variant: 'destructive',
      });
    } finally {
      setIsSigning(false);
    }
  };

  return {
    document,
    isLoading,
    error,
    isSigning,
    handleSign,
  };
};
