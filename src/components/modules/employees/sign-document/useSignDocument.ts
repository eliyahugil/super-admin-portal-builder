
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DigitalSignatureData } from './types';

export const useSignDocument = (documentId: string) => {
  const [isSigning, setIsSigning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // שליפת פרטי המסמך
  const { data: document, isLoading, error } = useQuery({
    queryKey: ['signature-document', documentId],
    queryFn: async () => {
      if (!documentId) throw new Error('Document ID is required');
      
      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          *,
          assignee:employees!employee_documents_assignee_id_fkey(first_name, last_name, employee_id),
          uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(full_name)
        `)
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!documentId,
  });

  // מוטציה לחתימה על המסמך
  const signDocumentMutation = useMutation({
    mutationFn: async (digitalSignature: string) => {
      if (!documentId || !digitalSignature.trim()) {
        throw new Error('חתימה דיגיטלית נדרשת');
      }

      const signatureData: DigitalSignatureData = {
        signature_text: digitalSignature.trim(),
        signed_by: document?.assignee?.first_name + ' ' + document?.assignee?.last_name,
        signed_at: new Date().toISOString(),
        ip_address: 'user_ip',
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('employee_documents')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString(),
          digital_signature_data: signatureData as any
        })
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'הצלחה!',
        description: 'המסמך נחתם בהצלחה',
      });
      queryClient.invalidateQueries({ queryKey: ['signature-document', documentId] });
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה',
        description: error.message || 'לא ניתן לחתום על המסמך',
        variant: 'destructive',
      });
    },
  });

  const handleSign = async (digitalSignature: string) => {
    if (!digitalSignature.trim()) {
      toast({
        title: 'שגיאה',
        description: 'יש להזין חתימה דיגיטלית',
        variant: 'destructive',
      });
      return;
    }

    setIsSigning(true);
    try {
      await signDocumentMutation.mutateAsync(digitalSignature);
    } finally {
      setIsSigning(false);
    }
  };

  return {
    document,
    isLoading,
    error,
    isSigning,
    handleSign
  };
};
