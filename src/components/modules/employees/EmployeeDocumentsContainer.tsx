
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { EmployeeDocumentsViewer } from './EmployeeDocumentsViewer';
import { TemplateDocumentsList } from './TemplateDocumentsList';
import { SignatureDocumentsList } from './SignatureDocumentsList';
import { useEmployeeDocuments } from './hooks/useEmployeeDocuments';
import { useEmployeeDocumentDelete } from './hooks/useEmployeeDocumentDelete';
import { useEmployeeDocumentReminders } from './hooks/useEmployeeDocumentReminders';
import { useEmployeeDocumentUpload } from './hooks/useEmployeeDocumentUpload';

interface Props {
  employeeId: string;
  employeeName?: string;
  canEdit?: boolean;
}

export const EmployeeDocumentsContainer: React.FC<Props> = ({
  employeeId,
  employeeName = '',
  canEdit = false
}) => {
  const { toast } = useToast();
  const {
    documents,
    isLoading,
    refetch,
    selectedDocument,
    setSelectedDocument,
    isTemplateMode,
    queryKey
  } = useEmployeeDocuments(employeeId);

  // Use the upload hook with proper refetch
  const { uploading, handleFileUpload } = useEmployeeDocumentUpload(
    isTemplateMode ? undefined : employeeId,
    queryKey,
    () => {
      console.log('🔄 Upload success callback - refreshing documents');
      refetch();
    }
  );

  const deleteDocumentMutation = useEmployeeDocumentDelete(employeeId || '');
  const { 
    sendReminder, 
    reminderLoading, 
    reminderLog, 
    fetchReminders 
  } = useEmployeeDocumentReminders(employeeId || '');

  const handleView = (document: any) => {
    setSelectedDocument(document);
  };

  const handleDownload = async (document: any) => {
    try {
      const response = await fetch(document.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = document.document_name;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להוריד את המסמך',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (document: any) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את המסמך?')) {
      await deleteDocumentMutation.mutate({
        documentId: document.id,
        filePath: document.file_url
      });
      refetch();
    }
  };

  // פונקציה נפרדת להעלאת תבניות
  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canEdit) {
      // העלאה כתבנית (is_template = true)
      handleFileUpload(e, true);
    }
  };

  const onDocumentUpdated = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">טוען מסמכים...</span>
      </div>
    );
  }

  console.log('📊 Rendering with documents count:', documents.length);

  return (
    <div className="space-y-6" dir="rtl">
      {/* רק אם יש הרשאות עריכה או שיש תבניות להציג */}
      <TemplateDocumentsList
        documents={documents}
        canEdit={canEdit}
        uploading={uploading}
        reminderLoading={reminderLoading}
        reminderLog={reminderLog}
        onView={handleView}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onSendReminder={sendReminder}
        onFetchReminders={fetchReminders}
        onDocumentUpdated={onDocumentUpdated}
        onTemplateUpload={handleTemplateUpload}
      />
      
      {/* מסמכים לחתימה - תמיד מוצגים */}
      <SignatureDocumentsList
        documents={documents}
        canEdit={canEdit}
        uploading={uploading}
        reminderLoading={reminderLoading}
        reminderLog={reminderLog}
        onView={handleView}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onSendReminder={sendReminder}
        onFetchReminders={fetchReminders}
        onDocumentUpdated={onDocumentUpdated}
      />

      {selectedDocument && (
        <EmployeeDocumentsViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};
