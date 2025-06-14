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

  // --- QUERY for docs ---
  // 1. Templates: is_template = true, employee_id IS NULL (only when employeeId is falsy/empty)
  // 2. Regular: employee docs (employee_id matches or assignee), OR is_template = false and employee_id is NOT NULL
  const { data: documents, isLoading } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      // Fetch all docs for this employeeId, or all (if no employeeId)
      let query = supabase
        .from('employee_documents')
        .select(`
          *,
          assignee:employees!employee_documents_assignee_id_fkey(first_name, last_name, employee_id),
          uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      // For "כל העובדים" (employeeId falsy) - show everything, templates first
      // For specific employee: show their docs and assigned docs, exclude templates.
      if (!employeeId) {
        // No filtering needed: will filter in code below into templates and records
      } else {
        // Only non-templates for the selected employee
        query = query
          .eq('is_template', false)
          .eq('employee_id', employeeId);
      }

      const { data, error } = await query;
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

  // For "כל העובדים", separate template docs and normal ones
  let templates: any[] = [];
  let others: any[] = [];
  if (!employeeId && documents) {
    templates = documents.filter((d: any) => d.is_template && !d.employee_id);
    others = documents.filter((d: any) => !d.is_template);
  } else {
    others = documents || [];
  }

  // Disable upload: uploading OR (if employeeId is undefined, only allow for templates)
  let disableUpload = uploading;
  // For "כל העובדים", allow upload; for specific employee, as before.
  // Always allow uploading template when in "כל העובדים"
  // (employeeId === '' means templates)
  // uploading state already disables input.

  return (
    <div className="space-y-4">
      <EmployeeDocumentsHeader
        canEdit={canEdit}
        uploading={uploading}
        handleFileUpload={handleFileUpload}
        disableUpload={disableUpload}
      />
      {/* Show templates block if relevant */}
      {(!employeeId && templates.length > 0) && (
        <div>
          <div className="mb-2 text-right text-purple-700 font-semibold">תבניות מסמכים</div>
          <div className="space-y-3">
            {templates.map((document: any) => (
              <EmployeeDocumentCard
                key={document.id}
                document={document}
                canEdit={false} // No actions on template docs
                uploading={false}
                reminderLoading={null}
                reminderLog={{}}
                handleView={handleView}
                handleDownload={handleDownload}
                handleDelete={() => {}} // can't delete from here
                sendReminder={() => {}}
                fetchReminders={async () => {}}
              />
            ))}
          </div>
        </div>
      )}
      {/* Show regular/assigned docs */}
      {others && others.length > 0 ? (
        <div className="space-y-3">
          {others.map((document: any) => (
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
              {/* Show 'Assign to Employee' if needed, skip on template docs */}
              {canEdit && !document.assignee && !document.is_template &&
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
