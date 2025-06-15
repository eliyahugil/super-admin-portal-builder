
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { TemplateDocumentsHeader } from './TemplateDocumentsHeader';
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
  onTemplateUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TemplateDocumentsList: React.FC<Props> = ({
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
  onTemplateUpload
}) => {
  // סינון רק תבניות
  const templateDocuments = documents.filter(doc => doc.is_template === true);

  if (templateDocuments.length === 0 && !canEdit) {
    return null; // אם אין תבניות ואין הרשאות עריכה, לא מציגים כלום
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <FileText className="h-5 w-5" />
          תבניות מסמכים ({templateDocuments.length})
        </CardTitle>
        <p className="text-sm text-gray-600">
          תבניות מסמכים שניתן לשלוח לעובדים לחתימה
        </p>
      </CardHeader>
      <CardContent>
        {canEdit && (
          <TemplateDocumentsHeader
            uploading={uploading}
            handleTemplateUpload={onTemplateUpload}
          />
        )}
        
        {templateDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">אין תבניות מסמכים</h3>
            <p>לא נמצאו תבניות מסמכים במערכת</p>
            {canEdit && (
              <p className="text-sm mt-2">השתמש בכפתור "העלה תבנית חדשה" למעלה כדי להוסיף תבנית ראשונה</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {templateDocuments.map((document) => (
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
