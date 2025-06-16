
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Signature, Clock, User } from 'lucide-react';
import { SignatureCanvas } from './SignatureCanvas';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface DigitalSignatureFormProps {
  onSign: (signature: string) => Promise<void>;
  isSigning: boolean;
  employeeName?: string;
}

export const DigitalSignatureForm: React.FC<DigitalSignatureFormProps> = ({
  onSign,
  isSigning,
  employeeName
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
    <div className="space-y-4">
      {/* מידע על החתימה */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            {employeeName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium">חותם:</span>
                <span>{employeeName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium">זמן חתימה:</span>
              <span>{format(new Date(), 'dd/MM/yyyy HH:mm', { locale: he })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* טופס החתימה */}
      <Card className="sticky bottom-4 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Signature className="h-6 w-6 text-green-600" />
            חתימה דיגיטלית
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              צייר את החתימה שלך במסגרת:
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
              <SignatureCanvas 
                onSignatureChange={handleSignatureChange}
                width={Math.min(400, window.innerWidth - 80)}
                height={120}
              />
            </div>
            
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
    </div>
  );
};
