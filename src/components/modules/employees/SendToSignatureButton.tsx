
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, RotateCcw } from 'lucide-react';
import { SendToSignatureDialog } from './send-signature/SendToSignatureDialog';

interface SendToSignatureButtonProps {
  documentId: string;
  documentName: string;
  onSent?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  isAlreadyAssigned?: boolean;
}

export const SendToSignatureButton: React.FC<SendToSignatureButtonProps> = ({
  documentId,
  documentName,
  onSent,
  variant = 'default',
  size = 'sm',
  isAlreadyAssigned = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log('🔍 SendToSignatureButton rendered for document:', documentName, 'ID:', documentId, 'Already assigned:', isAlreadyAssigned);

  const buttonText = isAlreadyAssigned ? 'שלח מחדש' : 'שלח לחתימה';
  const ButtonIcon = isAlreadyAssigned ? RotateCcw : Send;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className="flex items-center gap-2"
        onClick={() => {
          console.log('📌 SendToSignature button clicked for:', documentName);
          setIsOpen(true);
        }}
      >
        <ButtonIcon className="h-4 w-4" />
        {buttonText}
      </Button>
      
      <SendToSignatureDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        documentId={documentId}
        documentName={documentName}
        isAlreadyAssigned={isAlreadyAssigned}
        onSent={onSent}
      />
    </>
  );
};
