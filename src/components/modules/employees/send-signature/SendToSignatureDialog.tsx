
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SignatureForm } from './SignatureForm';
import { SignatureUrlDisplay } from './SignatureUrlDisplay';
import { useSendToSignature } from './useSendToSignature';

interface SendToSignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentName: string;
  onSent?: () => void;
}

export const SendToSignatureDialog: React.FC<SendToSignatureDialogProps> = ({
  open,
  onOpenChange,
  documentId,
  documentName,
  onSent
}) => {
  const {
    employees,
    employeesLoading,
    selectedEmployeeIds,
    isSending,
    signatureUrls,
    existingSignatures,
    handleSendToSignature,
    resetState,
    toggleEmployeeSelection,
    removeEmployeeFromSelection,
  } = useSendToSignature(documentId, documentName, onSent);

  const hasExistingSignatures = existingSignatures.length > 0;
  const hasSignatureUrls = Object.keys(signatureUrls).length > 0;

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  console.log('📬 SendToSignatureDialog rendered:', {
    documentId,
    documentName,
    open,
    hasSignatureUrls,
    signatureUrlsCount: Object.keys(signatureUrls).length
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>שליחה לחתימה דיגיטלית</DialogTitle>
          <DialogDescription>
            בחר עובדים לשליחת המסמך לחתימה דיגיטלית
          </DialogDescription>
        </DialogHeader>

        {hasSignatureUrls ? (
          <SignatureUrlDisplay
            signatureUrls={signatureUrls}
            employees={employees}
            onClose={handleClose}
          />
        ) : (
          <SignatureForm
            documentName={documentName}
            hasExistingSignatures={hasExistingSignatures}
            employees={employees}
            employeesLoading={employeesLoading}
            selectedEmployeeIds={selectedEmployeeIds}
            existingSignatures={existingSignatures}
            isSending={isSending}
            signatureUrls={signatureUrls}
            onEmployeeToggle={toggleEmployeeSelection}
            onEmployeeRemove={removeEmployeeFromSelection}
            onSend={handleSendToSignature}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
