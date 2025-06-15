
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSendToSignature = (documentId: string, documentName: string, onSent?: () => void) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState('');
  const { toast } = useToast();

  // שליפת רשימת עובדים פעילים
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['active-employees-for-signature'],
    queryFn: async () => {
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

  const handleSendToSignature = async (isAlreadyAssigned: boolean) => {
    if (!selectedEmployeeId) {
      toast({
        title: 'שגיאה',
        description: 'יש לבחור עובד לשליחה',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    console.log('📤 Sending document to signature:', { documentId, selectedEmployeeId, isResend: isAlreadyAssigned });
    
    try {
      // יצירת טוקן ייחודי לחתימה דיגיטלית
      const signatureToken = crypto.randomUUID();
      
      // עדכון מסמך עם פרטי העובד המיועד לחתימה
      const updateData: any = {
        assignee_id: selectedEmployeeId,
        status: 'pending_signature',
        reminder_count: 0,
        reminder_sent_at: new Date().toISOString(),
        digital_signature_token: signatureToken,
      };

      // אם זה שליחה מחדש, נאפס את תאריך החתימה
      if (isAlreadyAssigned) {
        updateData.signed_at = null;
        updateData.digital_signature_data = null;
      }

      const { error: updateError } = await supabase
        .from('employee_documents')
        .update(updateData)
        .eq('id', documentId);

      if (updateError) {
        console.error('Error updating document:', updateError);
        throw updateError;
      }

      // יצירת קישור חתימה דיגיטלית
      const baseUrl = window.location.origin;
      const signUrl = `${baseUrl}/sign-document/${documentId}?token=${signatureToken}`;
      setSignatureUrl(signUrl);

      const actionText = isAlreadyAssigned ? 'נשלח מחדש' : 'נשלח';
      toast({
        title: 'הצלחה',
        description: `המסמך "${documentName}" ${actionText} לחתימה בהצלחה`,
      });

      console.log('✅ Document sent successfully, signature URL:', signUrl);
      onSent?.();
    } catch (error: any) {
      console.error('Error sending document for signature:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשלוח את המסמך לחתימה',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const resetState = () => {
    setSignatureUrl('');
    setSelectedEmployeeId('');
    setIsSending(false);
  };

  return {
    employees,
    employeesLoading,
    selectedEmployeeId,
    setSelectedEmployeeId,
    isSending,
    signatureUrl,
    handleSendToSignature,
    resetState,
  };
};
