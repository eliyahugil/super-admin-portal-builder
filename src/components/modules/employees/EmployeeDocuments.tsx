// Refactored: clean orchestrator with focused logic, helpers and header extracted.

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { getFileType } from './helpers/documentHelpers';
import { EmployeeDocumentCard } from './EmployeeDocumentCard';
import { EmployeeDocumentsEmptyState } from './EmployeeDocumentsEmptyState';
import { EmployeeDocumentsHeader } from './EmployeeDocumentsHeader';

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
  const [reminderLoading, setReminderLoading] = useState<string | null>(null);
  const [reminderLog, setReminderLog] = useState<Record<string, any[]>>({});
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();

  // Query: Get employee documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          *,
          uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(full_name)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Mutation: Delete document
  const deleteDocumentMutation = useMutation({
    mutationFn: async ({ documentId, filePath }: { documentId: string; filePath: string }) => {
      await supabase.storage.from('employee-files').remove([filePath]);
      await supabase.from('employee_documents').delete().eq('id', documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      toast({
        title: 'הצלחה',
        description: 'המסמך נמחק בהצלחה',
      });
    },
    onError: () => {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את המסמך',
        variant: 'destructive',
      });
    },
  });

  // File upload handler
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
      const filePath = `employee-documents/${employeeId}/${fileName}`;

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

      const { error: insertError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: employeeId,
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
    }
  };

  // Reminder fetch and send functions (logic unchanged, passing as props)
  const fetchReminders = async (docId: string) => {
    const { data, error } = await supabase
      .from('employee_document_reminders')
      .select('id, sent_at, message, reminder_type, sent_by')
      .eq('document_id', docId)
      .order('sent_at', { ascending: false });
    if (!error) setReminderLog((prev) => ({ ...prev, [docId]: data }));
  };

  const sendReminder = async (document: any) => {
    setReminderLoading(document.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('No authenticated user!');
      const { error } = await supabase
        .from('employee_document_reminders')
        .insert({
          document_id: document.id,
          employee_id: document.employee_id,
          sent_by: user.id,
          reminder_type: 'system',
          message: `תזכורת נשלחה על ידי מנהל המערכת בתאריך ${new Date().toLocaleString('he-IL')}`,
        });
      if (error) throw error;

      await supabase.from('employee_documents').update({
        reminder_count: (document.reminder_count ?? 0) + 1,
        reminder_sent_at: new Date().toISOString()
      }).eq('id', document.id);

      toast({
        title: 'תזכורת נשלחה',
        description: 'נשלחה תזכורת לעובד עבור מסמך זה',
      });
      fetchReminders(document.id);
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
    } catch (e: any) {
      toast({
        title: 'שגיאה בשליחת תזכורת',
        description: e.message ?? 'תקלה בשליחת התזכורת. נסו שוב.',
        variant: 'destructive',
      });
    } finally {
      setReminderLoading(null);
    }
  };

  // Actions
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

  // Loading skeleton
  if (isLoading) {
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

  return (
    <div className="space-y-4">
      <EmployeeDocumentsHeader
        canEdit={canEdit}
        uploading={uploading}
        handleFileUpload={handleFileUpload}
      />
      {documents && documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((document: any) => (
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
            />
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
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
