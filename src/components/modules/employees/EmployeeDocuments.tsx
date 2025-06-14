import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { getFileType } from './helpers/documentHelpers';
import { EmployeeDocumentCard } from './EmployeeDocumentCard';
import { EmployeeDocumentsEmptyState } from './EmployeeDocumentsEmptyState';
import { EmployeeDocumentsHeader } from './EmployeeDocumentsHeader';
import { useEmployeeDocumentReminders } from './hooks/useEmployeeDocumentReminders';
import { useEmployeeDocumentDelete } from './hooks/useEmployeeDocumentDelete';

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
  const [uploading, setUploading] = useState(false);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch employee options for assignment
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
    enabled: canEdit, // always available to assign to anyone
  });

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

  // File upload handler – allow upload without assignee/employeeId
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!profile?.id && !user?.id) {
      toast({
        title: 'שגיאה',
        description: 'נדרש להתחבר למערכת כדי להעלות קבצים',
        variant: 'destructive',
      });
      return;
    }
    try {
      setUploading(true);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) throw new Error('No active session!');
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      // השתמש או בemployeeId (פר עובד) או ב"תבניות" (אם צפייה כללית)
      const fileEmployeeId = employeeId || 'templates';
      const filePath = `employee-documents/${fileEmployeeId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from('employee-files')
        .getPublicUrl(filePath);

      const uploadedBy = profile?.id || user?.id;

      // אל תצמיד employee_id בעת העלאה רוחבית, תן רק במסך עובד להצמיד
      const { error: insertError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: employeeId || null, // במידה ופר עובד
          assignee_id: null, // אסור להצמיד כאן
          document_name: file.name,
          document_type: getFileType(file.name),
          file_url: urlData.publicUrl,
          uploaded_by: uploadedBy,
        });

      if (insertError) {
        await supabase.storage.from('employee-files').remove([uploadData.path]);
        throw new Error(`Database error: ${insertError.message}`);
      }

      toast({
        title: 'הצלחה',
        description: 'המסמך הועלה בהצלחה',
      });

      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: error?.message ?? 'שגיאה בהעלאת מסמך',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      event.target.value = '';
      setAssigneeId('');
    }
  };

  // שליחת מסמך לחתימה – עדכון assignee_id למסמך קיים
  const handleAssignAssignee = async (docId: string, assignId: string) => {
    if (!assignId) return;
    setAssigningId(docId);
    try {
      const { error } = await supabase
        .from('employee_documents')
        .update({ assignee_id: assignId })
        .eq('id', docId);

      if (error) throw error;
      toast({ title: 'הצלחה', description: 'המסמך שובץ לחתימה.' });
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
    } catch (e: any) {
      toast({
        title: 'שגיאה',
        description: e?.message ?? 'הפעולה נכשלה',
        variant: 'destructive',
      });
    } finally {
      setAssigningId(null);
    }
  };
  
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

  // Disable upload only בטעינה
  const disableUpload = uploading;

  // 'הקצה לחתימה' – קומפוננטה קטנה (בטבלת המסמכים)
  function AssignToEmployeeSelect({ docId }: { docId: string }) {
    const [tempId, setTempId] = useState('');
    return (
      <div className="flex gap-2 items-center">
        <select
          value={tempId}
          className="px-2 py-1 rounded border text-sm"
          onChange={e => setTempId(e.target.value)}
          disabled={assigningId === docId || uploading}
        >
          <option value="">בחר עובד</option>
          {employees?.map((emp: any) => (
            <option key={emp.id} value={emp.id}>
              {emp.first_name} {emp.last_name} ({emp.employee_id || ''})
            </option>
          ))}
        </select>
        <button
          disabled={!tempId || assigningId === docId}
          className="bg-blue-500 hover:bg-blue-700 text-xs text-white px-3 py-1 rounded disabled:bg-blue-200"
          onClick={() => handleAssignAssignee(docId, tempId)}
          type="button"
        >
          {assigningId === docId ? 'שולח...' : 'שלח לחתימה'}
        </button>
      </div>
    );
  }

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
              {/* אם אין assignee_id, הצג כפתור הקצה/שלח לחתימה */}
              {canEdit && !document.assignee &&
                <AssignToEmployeeSelect docId={document.id} />
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
