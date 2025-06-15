
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface SignedDocumentDisplayProps {
  signatureData: any;
  signedAt: string;
}

export const SignedDocumentDisplay: React.FC<SignedDocumentDisplayProps> = ({
  signatureData,
  signedAt
}) => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="h-6 w-6" />
          המסמך נחתם בהצלחה
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-700 mb-2">החתימה שלך:</h4>
          {signatureData?.signature_image ? (
            <div className="border border-gray-200 rounded p-2 bg-white inline-block">
              <img 
                src={signatureData.signature_image} 
                alt="חתימה דיגיטלית"
                className="max-w-full h-auto"
                style={{ maxHeight: '100px' }}
              />
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              לא נמצאה תמונת חתימה
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span className="font-medium">תאריך חתימה:</span>
            <span>{format(new Date(signedAt), 'dd/MM/yyyy HH:mm', { locale: he })}</span>
          </div>
        </div>
        
        <div className="bg-green-100 p-3 rounded-lg">
          <p className="text-green-800 text-sm">
            ✅ המסמך נחתם בהצלחה. החתימה שלך נשמרה במערכת.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
