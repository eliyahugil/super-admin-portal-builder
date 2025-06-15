
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useSignDocument = (documentId: string) => {
  const [isSigning, setIsSigning] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // שליפת פרטי המסמך
  const { data: document, isLoading, error } = useQuery({
    queryKey: ['document-for-signature', documentId],
    queryFn: async () => {
      if (!documentId) return null;
      
      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          *,
          employee:employees!employee_documents_employee_id_fkey(
            id, first_name, last_name, employee_id
          )
        `)
        .eq('id', documentId)
        .single();
      
      if (error) {
        console.error('Error fetching document:', error);
        throw error;
      }
      
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
        signed_by: 'עובד', // ניתן לשפר בהמשך עם פרטי המשתמש
        timestamp: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('employee_documents')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString(),
          digital_signature_data: signatureData,
        })
        .eq('id', documentId);

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Document signed successfully');
      
      toast({
        title: 'הצלחה',
        description: 'המסמך נחתם בהצלחה!',
      });

      // רענון הנתונים
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
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
