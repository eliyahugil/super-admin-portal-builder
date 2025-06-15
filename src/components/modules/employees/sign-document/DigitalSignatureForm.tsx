
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Signature } from 'lucide-react';
import { SignatureCanvas } from './SignatureCanvas';

interface DigitalSignatureFormProps {
  onSign: (signature: string) => Promise<void>;
  isSigning: boolean;
}

export const DigitalSignatureForm: React.FC<DigitalSignatureFormProps> = ({
  onSign,
  isSigning
}) => {
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!signatureData) return;
    await onSign(signatureData);
  };

  const handleSignatureChange = (signature: string | null) => {
    setSignatureData(signature);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Signature className="h-6 w-6 text-green-600" />
          חתימה דיגיטלית
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            צייר את החתימה שלך:
          </label>
          
          <SignatureCanvas 
            onSignatureChange={handleSignatureChange}
            width={400}
            height={150}
          />
          
          <p className="text-xs text-gray-500 mt-2">
            החתימה הדיגיטלית מהווה הסכמה משפטית לתוכן המסמך
          </p>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={isSigning || !signatureData}
          className="w-full"
          size="lg"
        >
          {isSigning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              חותם...
            </>
          ) : (
            <>
              <Signature className="h-4 w-4 mr-2" />
              חתום על המסמך
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
