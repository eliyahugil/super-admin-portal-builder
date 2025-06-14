
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { DigitalSignatureData } from './types';

interface SignedDocumentDisplayProps {
  signatureData: DigitalSignatureData;
  signedAt: string;
}

export const SignedDocumentDisplay: React.FC<SignedDocumentDisplayProps> = ({
  signatureData,
  signedAt
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-6 w-6" />
          המסמך נחתם בהצלחה
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="space-y-2">
            <p><strong>נחתם על ידי:</strong> {signatureData.signed_by}</p>
            <p><strong>חתימה:</strong> {signatureData.signature_text}</p>
            <p><strong>תאריך חתימה:</strong> {format(new Date(signedAt), 'dd/MM/yyyy HH:mm', { locale: he })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
