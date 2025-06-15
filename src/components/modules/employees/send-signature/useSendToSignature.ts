
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSignatureData } from './useSignatureData';
import { useEmployeeSelection } from './useEmployeeSelection';
import { SignatureService } from './signatureService';

export const useSendToSignature = (documentId: string, documentName: string, onSent?: () => void) => {
  const [isSending, setIsSending] = useState(false);
  const [signatureUrls, setSignatureUrls] = useState<{ [employeeId: string]: string }>({});
  const { toast } = useToast();

  // שליפת נתונים
  const { employees, employeesLoading, existingSignatures } = useSignatureData(documentId);

  // ניהול בחירת עובדים
  const {
    selectedEmployeeIds,
    setSelectedEmployeeIds,
    addEmployeeToSelection,
    removeEmployeeFromSelection,
    toggleEmployeeSelection,
    resetSelection,
  } = useEmployeeSelection();

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
    
    try {
      const result = await SignatureService.sendToSignature(
        documentId,
        selectedEmployeeIds,
        existingSignatures,
        isResending
      );

      setSignatureUrls(result.signatureUrls);

      if (result.successCount > 0) {
        const actionText = isResending ? 'נשלח מחדש' : 'נשלח';
        toast({
          title: 'הצלחה',
          description: `המסמך "${documentName}" ${actionText} לחתימה ל-${result.successCount} עובדים${result.errorCount > 0 ? ` (${result.errorCount} שגיאות)` : ''}`,
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
    resetSelection();
    setIsSending(false);
  };

  return {
    employees,
    employeesLoading,
    selectedEmployeeIds,
    setSelectedEmployeeIds,
    isSending,
    signatureUrls,
    existingSignatures,
    handleSendToSignature,
    resetState,
    addEmployeeToSelection,
    removeEmployeeFromSelection,
    toggleEmployeeSelection,
  };
};
