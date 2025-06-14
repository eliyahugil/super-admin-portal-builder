
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Signature } from 'lucide-react';

interface DigitalSignatureFormProps {
  onSign: (signature: string) => Promise<void>;
  isSigning: boolean;
}

export const DigitalSignatureForm: React.FC<DigitalSignatureFormProps> = ({
  onSign,
  isSigning
}) => {
  const [digitalSignature, setDigitalSignature] = useState('');

  const handleSubmit = async () => {
    if (!digitalSignature.trim()) return;
    await onSign(digitalSignature);
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
            הזן את שמך המלא כחתימה דיגיטלית:
          </label>
          <Textarea
            value={digitalSignature}
            onChange={(e) => setDigitalSignature(e.target.value)}
            placeholder="לדוגמה: יוחנן ישראלי"
            className="text-lg font-cursive"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            החתימה הדיגיטלית מהווה הסכמה משפטית לתוכן המסמך
          </p>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={isSigning || !digitalSignature.trim()}
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
