
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSendToSignature = (documentId: string, documentName: string, onSent?: () => void) => {
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [signatureUrls, setSignatureUrls] = useState<{ [employeeId: string]: string }>({});
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

  // שליפת חתימות קיימות למסמך
  const { data: existingSignatures } = useQuery({
    queryKey: ['document-signatures', documentId],
    queryFn: async () => {
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

  const handleSendToSignature = async (isResending: boolean = false) => {
    if (selectedEmployeeIds.length === 0) {
      toast({
        title: 'שגיאה',
        description: 'יש לבחור לפחות עובד אחד לשליחה',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    console.log('📤 Sending document to signature:', { 
      documentId, 
      selectedEmployeeIds, 
      isResending 
    });
    
    try {
      const baseUrl = window.location.origin;
      const newSignatureUrls: { [employeeId: string]: string } = {};
      let successCount = 0;
      let errorCount = 0;

      // שליחה לכל עובד שנבחר
      for (const employeeId of selectedEmployeeIds) {
        try {
          // בדיקה אם כבר קיימת חתימה לעובד הזה
          const existingSignature = existingSignatures?.find(sig => sig.employee_id === employeeId);
          
          if (existingSignature && !isResending) {
            // אם יש חתימה קיימת ולא מדובר בשליחה מחדש, נדלג
            console.log(`🔄 Signature already exists for employee ${employeeId}, skipping`);
            continue;
          }

          let signatureToken: string;
          
          if (existingSignature) {
            // עדכון חתימה קיימת - אבל רק אם היא לא נחתמה כבר
            if (existingSignature.status === 'signed') {
              console.log(`✅ Employee ${employeeId} already signed, skipping update`);
              continue;
            }
            
            // עדכון חתימה ממתינה בלבד
            signatureToken = crypto.randomUUID();
            const { error: updateError } = await supabase
              .from('employee_document_signatures')
              .update({
                digital_signature_token: signatureToken,
                sent_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                // לא משנים את status או signed_at - נשאיר אותם כפי שהם
              })
              .eq('id', existingSignature.id)
              .eq('status', 'pending'); // עדכון רק אם הסטטוס הוא pending

            if (updateError) throw updateError;
          } else {
            // יצירת חתימה חדשה
            signatureToken = crypto.randomUUID();
            const { error: insertError } = await supabase
              .from('employee_document_signatures')
              .insert({
                document_id: documentId,
                employee_id: employeeId,
                digital_signature_token: signatureToken,
                status: 'pending',
                sent_at: new Date().toISOString(),
              });

            if (insertError) throw insertError;
          }

          // יצירת קישור חתימה דיגיטלית
          const signUrl = `${baseUrl}/sign-document/${documentId}?token=${signatureToken}`;
          newSignatureUrls[employeeId] = signUrl;
          successCount++;
          
          console.log(`✅ Document sent successfully to employee ${employeeId}, signature URL:`, signUrl);
        } catch (employeeError) {
          console.error(`❌ Error sending to employee ${employeeId}:`, employeeError);
          errorCount++;
        }
      }

      setSignatureUrls(newSignatureUrls);

      if (successCount > 0) {
        const actionText = isResending ? 'נשלח מחדש' : 'נשלח';
        toast({
          title: 'הצלחה',
          description: `המסמך "${documentName}" ${actionText} לחתימה ל-${successCount} עובדים${errorCount > 0 ? ` (${errorCount} שגיאות)` : ''}`,
        });
        onSent?.();
      } else {
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לשלוח את המסמך לאף עובד',
          variant: 'destructive',
        });
      }
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
    setSignatureUrls({});
    setSelectedEmployeeIds([]);
    setIsSending(false);
  };

  const addEmployeeToSelection = (employeeId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(employeeId) ? prev : [...prev, employeeId]
    );
  };

  const removeEmployeeFromSelection = (employeeId: string) => {
    setSelectedEmployeeIds(prev => prev.filter(id => id !== employeeId));
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  return {
    employees,
    employeesLoading,
    selectedEmployeeIds,
    setSelectedEmployeeIds,
    isSending,
    signatureUrls,
    existingSignatures: existingSignatures || [],
    handleSendToSignature,
    resetState,
    addEmployeeToSelection,
    removeEmployeeFromSelection,
    toggleEmployeeSelection,
  };
};
