
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { EmployeeDocumentCard } from './EmployeeDocumentCard';
import { EmployeeDocumentsHeader } from './EmployeeDocumentsHeader';
import { EmployeeDocumentsEmptyState } from './EmployeeDocumentsEmptyState';
import { EmployeeDocumentsViewer } from './EmployeeDocumentsViewer';
import { useEmployeeDocumentDelete } from './hooks/useEmployeeDocumentDelete';
import { useEmployeeDocumentReminders } from './hooks/useEmployeeDocumentReminders';
import { useEmployeeDocumentUpload } from './hooks/useEmployeeDocumentUpload';

interface Props {
  employeeId: string;
  employeeName?: string;
  canEdit?: boolean;
}

export const EmployeeDocuments: React.FC<Props> = ({
  employeeId,
  employeeName = '',
  canEdit = false
}) => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  // Determine if we're in template mode (when employeeId is empty or falsy)
  const isTemplateMode = !employeeId;
  const queryKey = isTemplateMode 
    ? ['employee-documents-templates'] 
    : ['employee-documents', employeeId];

  console.log('🔍 EmployeeDocuments - Mode:', { isTemplateMode, employeeId, profileId: profile?.id });

  // שליפת מסמכים - לוגיקה פשוטה יותר
  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('📥 Starting documents query for mode:', isTemplateMode ? 'templates' : 'employee');
      
      let query = supabase
        .from('employee_documents')
        .select(`
          *,
          uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(full_name),
          assignee:employees!employee_documents_assignee_id_fkey(
            id,
            first_name,
            last_name,
            employee_id
          )
        `)
        .order('created_at', { ascending: false });

      if (isTemplateMode) {
        // עבור תבניות - רק מסמכים עם is_template = true
        console.log('🎯 Querying templates only');
        query = query.eq('is_template', true);
      } else {
        // עבור עובד ספציפי - רק מסמכים של העובד הזה
        console.log('🎯 Querying documents for employee:', employeeId);
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Query error:', error);
        throw error;
      }
      
      console.log('✅ Documents fetched:', data?.length || 0, 'documents');
      console.log('📋 Documents details:', data);
      
      return data || [];
    },
    enabled: true, // תמיד מאופשר
  });

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

  if (documents.length === 0) {
    return (
      <EmployeeDocumentsEmptyState 
        canEdit={canEdit}
        employeeName={employeeName || (isTemplateMode ? 'תבניות מסמכים' : 'העובד')}
        uploading={uploading}
        handleFileUpload={handleFileUpload}
        disableUpload={false}
      />
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <EmployeeDocumentsHeader 
        canEdit={canEdit}
        uploading={uploading}
        handleFileUpload={handleFileUpload}
        disableUpload={false}
      />
      
      <div className="space-y-4">
        {documents.map((document) => (
          <EmployeeDocumentCard
            key={document.id}
            document={document}
            canEdit={canEdit}
            uploading={uploading}
            reminderLoading={reminderLoading}
            reminderLog={reminderLog}
            handleView={handleView}
            handleDownload={handleDownload}
            handleDelete={handleDelete}
            sendReminder={sendReminder}
            fetchReminders={fetchReminders}
            onDocumentUpdated={onDocumentUpdated}
          />
        ))}
      </div>

      {selectedDocument && (
        <EmployeeDocumentsViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};
