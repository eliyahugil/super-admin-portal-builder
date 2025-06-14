
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { EmployeeDocumentCard } from './EmployeeDocumentCard';
import { EmployeeDocumentsHeader } from './EmployeeDocumentsHeader';
import { EmployeeDocumentsEmptyState } from './EmployeeDocumentsEmptyState';
import { EmployeeDocumentsViewer } from './EmployeeDocumentsViewer';
import { useEmployeeDocumentDelete } from './hooks/useEmployeeDocumentDelete';
import { useEmployeeDocumentReminders } from './hooks/useEmployeeDocumentReminders';

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
  const { businessId } = useBusiness();

  // שליפת מסמכים - אם אין employeeId נציג את כל המסמכים של העסק
  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['employee-documents', employeeId, businessId],
    queryFn: async () => {
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

      // אם יש employeeId ספציפי, נסנן לפיו
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      } else if (businessId) {
        // אחרת נסנן לפי עסק באמצעות join עם employees
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id')
          .eq('business_id', businessId);

        if (employeeError) throw employeeError;
        
        const employeeIds = employeeData?.map(emp => emp.id) || [];
        if (employeeIds.length > 0) {
          query = query.in('employee_id', employeeIds);
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!(employeeId || businessId),
  });

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
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = document.document_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
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
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <EmployeeDocumentsEmptyState 
        canEdit={canEdit}
        employeeName={employeeName || 'העובד'}
        uploading={false}
        handleFileUpload={() => {}}
        disableUpload={!employeeId}
      />
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <EmployeeDocumentsHeader 
        canEdit={canEdit}
        uploading={false}
        handleFileUpload={() => {}}
        disableUpload={!employeeId}
      />
      
      <div className="space-y-4">
        {documents.map((document) => (
          <EmployeeDocumentCard
            key={document.id}
            document={document}
            canEdit={canEdit}
            uploading={false}
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
