
import React from 'react';
import { X, FileText, Calendar, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface EmployeeDocumentsViewerProps {
  document: any;
  onClose: () => void;
}

const isValidSignatureData = (data: any): boolean => {
  return data && typeof data === 'object' && data.signature_image;
};

export const EmployeeDocumentsViewer: React.FC<EmployeeDocumentsViewerProps> = ({
  document,
  onClose,
}) => {
  const isSignedDocument = document.status === 'signed' && !!document.signed_at && !!document.digital_signature_data;
  const signatureData = isValidSignatureData(document.digital_signature_data) 
    ? document.digital_signature_data 
    : null;

  console.log('📄 Viewing document:', {
    id: document.id,
    name: document.document_name,
    isSigned: isSignedDocument,
    hasSignature: !!signatureData,
    signedAt: document.signed_at,
    employeeId: document.employee?.id
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">{document.document_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {document.document_type === 'contract' ? 'חוזה' : 
                   document.document_type === 'form' ? 'טופס' : 
                   document.document_type === 'id' ? 'תעודת זהות' : 'אחר'}
                </Badge>
                {isSignedDocument && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    נחתם
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">פרטי המסמך</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {document.employee && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>עובד: {document.employee.first_name} {document.employee.last_name}</span>
                  {document.employee.employee_id && (
                    <span className="text-gray-500">({document.employee.employee_id})</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>
                  הועלה: {format(new Date(document.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                </span>
              </div>
              {isSignedDocument && document.signed_at && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-700">
                    נחתם: {format(new Date(document.signed_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signature Display - רק אם המסמך באמת נחתם על ידי העובד הספציפי */}
          {isSignedDocument && signatureData && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  חתימה דיגיטלית של {document.employee?.first_name} {document.employee?.last_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-gray-700 mb-3">החתימה:</h4>
                  <div className="flex items-center justify-center border border-gray-200 rounded-lg p-4 bg-white">
                    <img 
                      src={signatureData.signature_image} 
                      alt="חתימה דיגיטלית"
                      className="max-w-full h-auto"
                      style={{ maxHeight: '150px', maxWidth: '300px' }}
                    />
                  </div>
                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    {signatureData.signed_by && (
                      <div>נחתם על ידי: {signatureData.signed_by}</div>
                    )}
                    {(signatureData.timestamp || document.signed_at) && (
                      <div>
                        זמן חתימה: {format(new Date(signatureData.timestamp || document.signed_at), 'dd/MM/yyyy HH:mm:ss', { locale: he })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">תצוגת המסמך</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={document.file_url}
                  className="w-full h-96"
                  title={document.document_name}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            סגור
          </Button>
          <Button onClick={() => window.open(document.file_url, '_blank')}>
            פתח במסך מלא
          </Button>
        </div>
      </div>
    </div>
  );
};
