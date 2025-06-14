import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { getFileType } from './helpers/documentHelpers';
import { EmployeeDocumentCard } from './EmployeeDocumentCard';
import { EmployeeDocumentsEmptyState } from './EmployeeDocumentsEmptyState';
import { EmployeeDocumentsHeader } from './EmployeeDocumentsHeader';
import { useEmployeeDocumentReminders } from './hooks/useEmployeeDocumentReminders';
import { useEmployeeDocumentDelete } from './hooks/useEmployeeDocumentDelete';
import { AssignToEmployeeSelect } from './AssignToEmployeeSelect';
import { useEmployeeDocumentUpload } from './hooks/useEmployeeDocumentUpload';
import { useEmployeeDocumentAssignment } from './hooks/useEmployeeDocumentAssignment';

interface EmployeeDocumentsProps {
  employeeId: string;
  employeeName: string;
  canEdit?: boolean;
}

export const EmployeeDocuments: React.FC<EmployeeDocumentsProps> = ({
  employeeId,
  employeeName,
  canEdit = true
}) => {
  const { profile, user } = useAuth();
  // Fetch employees for assignment
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees-for-assignee'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id')
        .eq('is_active', true)
        .order('first_name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: canEdit,
  });

  // Upload and assignment hooks
  const uploadQueryKey = ['employee-documents', employeeId];
  const { uploading, handleFileUpload, setUploading } = useEmployeeDocumentUpload(employeeId, uploadQueryKey);

  const { assigningId, handleAssignAssignee } = useEmployeeDocumentAssignment(employeeId, uploadQueryKey);

  const {
    reminderLog,
    reminderLoading,
    fetchReminders,
    sendReminder,
    setReminderLog
  } = useEmployeeDocumentReminders(employeeId);

  const deleteDocumentMutation = useEmployeeDocumentDelete(employeeId);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          *,
          assignee:employees!employee_documents_assignee_id_fkey(first_name, last_name, employee_id),
          uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(full_name)
        `)
        .eq(employeeId ? 'employee_id' : 'employee_id', employeeId || '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!(employeeId !== undefined),
  });

  // Download/view/delete logic
  const handleDownload = (document: any) => {
    if (document.file_url) {
      const link = document.createElement('a');
      link.href = document.file_url;
      link.download = document.document_name;
      link.click();
    }
  };

  const handleView = (document: any) => {
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  const handleDelete = (document: any) => {
    const pathParts = new URL(document.file_url).pathname.split('/');
    const filePath = decodeURIComponent(pathParts.slice(2).join('/'));
    deleteDocumentMutation.mutate({ documentId: document.id, filePath });
  };

  if (isLoading || employeesLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Disable upload אם אין employeeId (כל העובדים) או אם מעלה כרגע
  const disableUpload = uploading || !employeeId;

  return (
    <div className="space-y-4">
      <EmployeeDocumentsHeader
        canEdit={canEdit}
        uploading={uploading}
        handleFileUpload={handleFileUpload}
        disableUpload={disableUpload}
      />
      {documents && documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((document: any) => (
            <div key={document.id} className="space-y-2">
              <EmployeeDocumentCard
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
              />
              {/* Show 'Assign to Employee' if needed */}
              {canEdit && !document.assignee &&
                <AssignToEmployeeSelect
                  docId={document.id}
                  employees={employees ?? []}
                  assigningId={assigningId}
                  uploading={uploading}
                  onAssign={handleAssignAssignee}
                />
              }
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <EmployeeDocumentsEmptyState
              employeeName={employeeName}
              canEdit={canEdit}
              uploading={uploading}
              handleFileUpload={handleFileUpload}
              disableUpload={disableUpload}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
