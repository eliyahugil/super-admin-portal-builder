
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock, User, Calendar, Send } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface DocumentDetailsCardProps {
  document: any;
  isAlreadySigned: boolean;
  sentAt?: string;
  sentTo?: string;
}

export const DocumentDetailsCard: React.FC<DocumentDetailsCardProps> = ({
  document,
  isAlreadySigned,
  sentAt,
  sentTo
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
              <p className="text-green-700 font-medium">{format(new Date(document.signed_at), 'dd/MM/yyyy HH:mm', { locale: he })}</p>
            </div>
          )}
        </div>

        {/* מידע על שליחה */}
        {sentAt && sentTo && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Send className="h-4 w-4" />
              פרטי שליחה
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium">נשלח אל:</span>
                <span>{sentTo}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium">תאריך שליחה:</span>
                <span>{format(new Date(sentAt), 'dd/MM/yyyy HH:mm', { locale: he })}</span>
              </div>
            </div>
          </div>
        )}

        {/* תצוגת המסמך משופרת */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium mb-2">תוכן המסמך:</h3>
          <div className="bg-white border rounded p-2">
            {document.file_url ? (
              <div className="w-full" style={{ height: '500px' }}>
                <iframe
                  src={document.file_url}
                  className="w-full h-full border-0"
                  title={document.document_name}
                  style={{ 
                    minHeight: '500px',
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                  }}
                />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">לא ניתן להציג את תוכן המסמך</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
