
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
  
  // ספירת חתימות בהמתנה ומושלמות
  const pendingSignatures = existingSignatures.filter(sig => sig.status === 'pending');
  const completedSignatures = existingSignatures.filter(sig => sig.status === 'signed');
  const hasPartialSignatures = completedSignatures.length > 0 && pendingSignatures.length > 0;

  console.log('🔍 SendToSignatureDialog rendered:', {
    isOpen,
    documentId,
    documentName,
    isAlreadyAssigned,
    employeesCount: employees?.length || 0,
    selectedEmployeeIds,
    hasSignatureUrls,
    hasExistingSignatures,
    pendingCount: pendingSignatures.length,
    completedCount: completedSignatures.length,
    hasPartialSignatures
  });

  // קביעת הכותרת על בסיס הסטטוס
  const getDialogTitle = () => {
    if (hasExistingSignatures) {
      if (hasPartialSignatures) {
        return 'הוסף עוד נמענים לחתימה';
      } else if (completedSignatures.length === existingSignatures.length) {
        return 'שלח מסמך מחדש לחתימה';
      } else {
        return 'שלח מסמך מחדש או הוסף נמענים';
      }
    }
    return 'שלח מסמך לחתימה';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {getDialogTitle()}
          </DialogTitle>
          {hasExistingSignatures && (
            <div className="text-sm text-gray-600 mt-2">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium text-blue-900 mb-1">סטטוס נוכחי:</div>
                <div className="flex gap-4 text-xs">
                  {completedSignatures.length > 0 && (
                    <span className="text-green-700">
                      ✅ {completedSignatures.length} חתמו
                    </span>
                  )}
                  {pendingSignatures.length > 0 && (
                    <span className="text-orange-700">
                      ⏳ {pendingSignatures.length} ממתינים
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  אתה יכול להוסיף עוד נמענים או לשלוח מחדש לקיימים
                </div>
              </div>
            </div>
          )}
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
