
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
    selectedEmployeeId,
    setSelectedEmployeeId,
    isSending,
    signatureUrl,
    handleSendToSignature,
    resetState,
  } = useSendToSignature(documentId, documentName, onSent);

  const handleClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const handleSend = () => {
    handleSendToSignature(isAlreadyAssigned);
  };

  console.log('🔍 SendToSignatureDialog rendered:', {
    isOpen,
    documentId,
    documentName,
    isAlreadyAssigned,
    employeesCount: employees?.length || 0,
    selectedEmployeeId,
    signatureUrl
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isAlreadyAssigned ? 'שלח מסמך מחדש לחתימה' : 'שלח מסמך לחתימה'}
          </DialogTitle>
        </DialogHeader>
        
        {!signatureUrl ? (
          <SignatureForm
            documentName={documentName}
            isAlreadyAssigned={isAlreadyAssigned}
            employees={employees || []}
            employeesLoading={employeesLoading}
            selectedEmployeeId={selectedEmployeeId}
            isSending={isSending}
            onEmployeeSelect={setSelectedEmployeeId}
            onSend={handleSend}
            onCancel={() => handleClose(false)}
          />
        ) : (
          <SignatureUrlDisplay
            signatureUrl={signatureUrl}
            onClose={() => handleClose(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
