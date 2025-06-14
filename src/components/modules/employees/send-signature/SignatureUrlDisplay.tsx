
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SignatureUrlDisplayProps {
  signatureUrl: string;
  onClose: () => void;
}

export const SignatureUrlDisplay: React.FC<SignatureUrlDisplayProps> = ({
  signatureUrl,
  onClose
}) => {
  const { toast } = useToast();

  const copySignatureUrl = () => {
    navigator.clipboard.writeText(signatureUrl);
    toast({
      title: 'הועתק!',
      description: 'קישור החתימה הועתק ללוח',
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-medium text-green-800 mb-2">קישור חתימה נוצר בהצלחה!</h3>
        <p className="text-sm text-green-700 mb-3">
          שלח את הקישור הבא לעובד לחתימה על המסמך:
        </p>
        <div className="flex items-center gap-2 p-2 bg-white border rounded text-sm font-mono break-all">
          {signatureUrl}
          <Button
            size="sm"
            variant="ghost"
            onClick={copySignatureUrl}
            className="flex-shrink-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button onClick={onClose}>
          סגור
        </Button>
      </div>
    </div>
  );
};
