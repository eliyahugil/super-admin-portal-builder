
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SignatureForm } from './SignatureForm';
import { SignatureUrlDisplay } from './SignatureUrlDisplay';
import { useSendToSignature } from './useSendToSignature';

interface SendToSignatureDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentName: string;
  isAlreadyAssigned: boolean;
  onSent?: () => void;
}

export const SendToSignatureDialog: React.FC<SendToSignatureDialogProps> = ({
  isOpen,
  onOpenChange,
  documentId,
  documentName,
  isAlreadyAssigned,
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

  const handleClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const hasSignatureUrls = Object.keys(signatureUrls).length > 0;
  const hasExistingSignatures = existingSignatures.length > 0;

  console.log('🔍 SendToSignatureDialog rendered:', {
    isOpen,
    documentId,
    documentName,
    isAlreadyAssigned,
    employeesCount: employees?.length || 0,
    selectedEmployeeIds,
    hasSignatureUrls,
    hasExistingSignatures
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {hasExistingSignatures ? 'שלח מסמך מחדש לחתימה' : 'שלח מסמך לחתימה'}
          </DialogTitle>
        </DialogHeader>
        
        {!hasSignatureUrls ? (
          <SignatureForm
            documentName={documentName}
            hasExistingSignatures={hasExistingSignatures}
            employees={employees || []}
            employeesLoading={employeesLoading}
            selectedEmployeeIds={selectedEmployeeIds}
            existingSignatures={existingSignatures}
            isSending={isSending}
            onEmployeeToggle={toggleEmployeeSelection}
            onEmployeeRemove={removeEmployeeFromSelection}
            onSend={handleSendToSignature}
            onCancel={() => handleClose(false)}
          />
        ) : (
          <SignatureUrlDisplay
            signatureUrls={signatureUrls}
            employees={employees || []}
            onClose={() => handleClose(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
