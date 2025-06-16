
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, User } from 'lucide-react';
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
        {/* מידע על החתימה */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {signatureData?.signed_by && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              <span className="font-medium">נחתם על ידי:</span>
              <span>{signatureData.signed_by}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="font-medium">זמן חתימה:</span>
            <span className="font-medium text-green-700">
              {format(new Date(signedAt), 'dd/MM/yyyy HH:mm:ss', { locale: he })}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-700 mb-2">החתימה שלך:</h4>
          {signatureData?.signature_image ? (
            <div className="border border-gray-200 rounded p-2 bg-white inline-block">
              <img 
                src={signatureData.signature_image} 
                alt="חתימה דיגיטלית"
                className="max-w-full h-auto"
                style={{ maxHeight: '150px', maxWidth: '300px' }}
              />
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              לא נמצאה תמונת חתימה
            </div>
          )}
        </div>
        
        <div className="bg-green-100 p-3 rounded-lg">
          <p className="text-green-800 text-sm">
            ✅ המסמך נחתם בהצלחה. החתימה שלך נשמרה במערכת ונוספה לקבצי העובד.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
