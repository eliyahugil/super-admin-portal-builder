
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenTool } from 'lucide-react';
import { EmployeeDocumentCard } from './EmployeeDocumentCard';

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
  onDocumentUpdated
}) => {
  // סינון רק מסמכים לחתימה (לא תבניות)
  const signatureDocuments = documents.filter(doc => doc.is_template !== true);

  if (signatureDocuments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <PenTool className="h-5 w-5" />
            מסמכים לחתימה (0)
          </CardTitle>
          <p className="text-sm text-gray-600">
            מסמכים שנשלחו לעובדים לחתימה
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <PenTool className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">אין מסמכים לחתימה</h3>
            <p>לא נמצאו מסמכים שנשלחו לחתימה</p>
            <p className="text-sm mt-2">שלח תבניות מסמכים לעובדים כדי ליצור מסמכים לחתימה</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <PenTool className="h-5 w-5" />
          מסמכים לחתימה ({signatureDocuments.length})
        </CardTitle>
        <p className="text-sm text-gray-600">
          מסמכים שנשלחו לעובדים לחתימה וסטטוס החתימה שלהם
        </p>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
