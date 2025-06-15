
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenTool, Upload } from 'lucide-react';
import { EmployeeDocumentCard } from './EmployeeDocumentCard';
import { Button } from '@/components/ui/button';

interface Props {
  documents: any[];
  canEdit: boolean;
  uploading: boolean;
  reminderLoading: string | null;
  reminderLog: Record<string, any[]>;
  onView: (document: any) => void;
  onDownload: (document: any) => void;
  onDelete: (document: any) => void;
  onSendReminder: (doc: any) => void;
  onFetchReminders: (docId: string) => Promise<void>;
  onDocumentUpdated?: () => void;
  onRegularDocumentUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SignatureDocumentsList: React.FC<Props> = ({
  documents,
  canEdit,
  uploading,
  reminderLoading,
  reminderLog,
  onView,
  onDownload,
  onDelete,
  onSendReminder,
  onFetchReminders,
  onDocumentUpdated,
  onRegularDocumentUpload
}) => {
  // סינון רק מסמכים לחתימה (לא תבניות)
  const signatureDocuments = documents.filter(doc => doc.is_template !== true);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onRegularDocumentUpload) {
      onRegularDocumentUpload(event);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <PenTool className="h-5 w-5" />
              מסמכים לחתימה ({signatureDocuments.length})
            </CardTitle>
            <p className="text-sm text-gray-600">
              מסמכים שנשלחו לעובדים לחתימה
            </p>
          </div>
          
          {canEdit && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="signature-document-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('signature-document-upload')?.click()}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'מעלה...' : 'העלה מסמך לחתימה'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {signatureDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <PenTool className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">אין מסמכים לחתימה</h3>
            <p>לא נמצאו מסמכים שנשלחו לחתימה</p>
            {canEdit && (
              <p className="text-sm mt-2">השתמש בכפתור "העלה מסמך לחתימה" למעלה כדי להוסיף מסמך</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {signatureDocuments.map((document) => (
              <EmployeeDocumentCard
                key={document.id}
                document={document}
                canEdit={canEdit}
                uploading={uploading}
                reminderLoading={reminderLoading}
                reminderLog={reminderLog}
                handleView={onView}
                handleDownload={onDownload}
                handleDelete={onDelete}
                sendReminder={onSendReminder}
                fetchReminders={onFetchReminders}
                onDocumentUpdated={onDocumentUpdated}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
