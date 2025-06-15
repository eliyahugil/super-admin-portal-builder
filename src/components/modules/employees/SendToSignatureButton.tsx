
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, RotateCcw, UserPlus } from 'lucide-react';
import { SendToSignatureDialog } from './send-signature/SendToSignatureDialog';

interface SendToSignatureButtonProps {
  documentId: string;
  documentName: string;
  onSent?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  isAlreadyAssigned?: boolean;
  customButtonText?: string;
  customIcon?: React.ComponentType<{ className?: string }>;
}

export const SendToSignatureButton: React.FC<SendToSignatureButtonProps> = ({
  documentId,
  documentName,
  onSent,
  variant = 'default',
  size = 'sm',
  isAlreadyAssigned = false,
  customButtonText,
  customIcon
}) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log('🔍 SendToSignatureButton rendered:', {
    documentId,
    documentName,
    isAlreadyAssigned,
    variant,
    size,
    customButtonText,
    hasCustomIcon: !!customIcon
  });

  // קביעת הטקסט והאייקון
  const buttonText = customButtonText || (isAlreadyAssigned ? 'שלח מחדש' : 'שלח לחתימה');
  const ButtonIcon = customIcon || (isAlreadyAssigned ? RotateCcw : Send);

  const handleClick = () => {
    console.log('📌 SendToSignature button clicked for:', documentName);
    setIsOpen(true);
  };

  const handleSent = () => {
    console.log('✅ Document sent callback for:', documentName);
    setIsOpen(false);
    onSent?.();
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className="flex items-center gap-2"
        onClick={handleClick}
        title={buttonText}
      >
        <ButtonIcon className="h-4 w-4" />
        {buttonText}
      </Button>
      
      <SendToSignatureDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        documentId={documentId}
        documentName={documentName}
        onSent={handleSent}
      />
    </>
  );
};
