
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface DocumentDetailsCardProps {
  document: any;
  isAlreadySigned: boolean;
}

export const DocumentDetailsCard: React.FC<DocumentDetailsCardProps> = ({
  document,
  isAlreadySigned
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          פרטי המסמך
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">שם המסמך:</label>
            <p className="text-lg font-medium">{document.document_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">סטטוס:</label>
            <div className="mt-1">
              {isAlreadySigned ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  נחתם
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Clock className="h-4 w-4 mr-1" />
                  ממתין לחתימה
                </Badge>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">תאריך יצירה:</label>
            <p>{format(new Date(document.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}</p>
          </div>
          {isAlreadySigned && document.signed_at && (
            <div>
              <label className="text-sm font-medium text-gray-700">תאריך חתימה:</label>
              <p>{format(new Date(document.signed_at), 'dd/MM/yyyy HH:mm', { locale: he })}</p>
            </div>
          )}
        </div>

        {/* תצוגת המסמך */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium mb-2">תוכן המסמך:</h3>
          <div className="bg-white border rounded p-4 max-h-96 overflow-y-auto">
            {document.file_url ? (
              <iframe
                src={document.file_url}
                className="w-full h-80"
                title={document.document_name}
              />
            ) : (
              <p className="text-gray-500">לא ניתן להציג את תוכן המסמך</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
