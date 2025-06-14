
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { getFileType } from './helpers/documentHelpers';
import { EmployeeDocumentCard } from './EmployeeDocumentCard';
import { EmployeeDocumentsEmptyState } from './EmployeeDocumentsEmptyState';
import { EmployeeDocumentsHeader } from './EmployeeDocumentsHeader';
import { TemplateDocumentsHeader } from './TemplateDocumentsHeader';
import { useEmployeeDocumentReminders } from './hooks/useEmployeeDocumentReminders';
import { useEmployeeDocumentDelete } from './hooks/useEmployeeDocumentDelete';
import { AssignToEmployeeSelect } from './AssignToEmployeeSelect';
import { useEmployeeDocumentUpload } from './hooks/useEmployeeDocumentUpload';
import { useTemplateDocumentUpload } from './hooks/useTemplateDocumentUpload';
import { useEmployeeDocumentAssignment } from './hooks/useEmployeeDocumentAssignment';
import { StorageService } from '@/services/StorageService';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  // בדיקת גישה לדלי בעת טעינת הקומפוננט
  useEffect(() => {
    const checkBucket = async () => {
      try {
        console.log('🔍 Checking storage bucket access...');
        const hasAccess = await StorageService.checkBucketAccess();
        if (!hasAccess) {
          console.warn('⚠️ Storage bucket access issue detected');
          toast({
            title: 'בעיה במערכת האחסון',
            description: 'הדלי לא נמצא או שאין הרשאות גישה מתאימות. פנו למנהל המערכת.',
            variant: 'destructive',
          });
        } else {
          console.log('✅ Storage bucket access confirmed - system is ready for file operations');
        }
      } catch (error) {
        console.error('💥 Error checking bucket access:', error);
        toast({
          title: 'שגיאה במערכת האחסון',
          description: 'לא ניתן לבדוק את מצב מערכת האחסון. נסו לרענן את הדף.',
          variant: 'destructive',
        });
      }
    };

    checkBucket();
  }, [toast]);

  // שליפת עובדים להקצאה
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

  // Hooks להעלאה והקצאה
  const uploadQueryKey = ['employee-documents', employeeId];
  const { uploading, handleFileUpload } = useEmployeeDocumentUpload(employeeId, uploadQueryKey);
  const { uploading: templateUploading, handleTemplateUpload } = useTemplateDocumentUpload(uploadQueryKey);
  const { assigningId, handleAssignAssignee } = useEmployeeDocumentAssignment(employeeId, uploadQueryKey);

  const {
    reminderLog,
    reminderLoading,
    fetchReminders,
    sendReminder,
  } = useEmployeeDocumentReminders(employeeId);

  const deleteDocumentMutation = useEmployeeDocumentDelete(employeeId);

  // שאילתה למסמכים
  const { data: documents, isLoading } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('employee_documents')
        .select(`
          *,
          assignee:employees!employee_documents_assignee_id_fkey(first_name, last_name, employee_id),
          uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (!employeeId) {
        // עבור "כל העובדים" - הצג הכל
      } else {
        // עבור עובד ספציפי - רק מסמכי העובד (לא תבניות)
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

  // פונקציות הורדה/צפייה/מחיקה
  const handleDownload = async (document: any) => {
    try {
      if (document.file_url) {
        console.log('📥 Attempting to download document:', document.document_name);
        
        const hasAccess = await StorageService.checkBucketAccess();
        if (!hasAccess) {
          toast({
            title: 'שגיאה',
            description: 'לא ניתן לגשת למערכת האחסון כרגע. פנו למנהל המערכת.',
            variant: 'destructive',
          });
          return;
        }

        const link = document.createElement('a');
        link.href = document.file_url;
        link.download = document.document_name;
        link.click();
        
        toast({
          title: 'הורדה החלה',
          description: `מוריד את הקובץ: ${document.document_name}`,
        });
      }
    } catch (error) {
      console.error('💥 Download error:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בהורדת הקובץ. נסו שוב או פנו למנהל המערכת.',
        variant: 'destructive',
      });
    }
  };

  const handleView = async (document: any) => {
    try {
      if (document.file_url) {
        console.log('👁️ Attempting to view document:', document.document_name);
        
        const hasAccess = await StorageService.checkBucketAccess();
        if (!hasAccess) {
          toast({
            title: 'שגיאה',
            description: 'לא ניתן לגשת למערכת האחסון כרגע. פנו למנהל המערכת.',
            variant: 'destructive',
          });
          return;
        }

        window.open(document.file_url, '_blank');
      }
    } catch (error) {
      console.error('💥 View error:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בפתיחת הקובץ. נסו שוב או פנו למנהל המערכת.',
        variant: 'destructive',
      });
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

  // הפרדת תבניות ממסמכים רגילים
  let templates: any[] = [];
  let others: any[] = [];
  if (!employeeId && documents) {
    templates = documents.filter((d: any) => d.is_template && !d.employee_id);
    others = documents.filter((d: any) => !d.is_template);
  } else {
    others = documents || [];
  }

  const isShowingAllEmployees = !employeeId;

  return (
    <div className="space-y-6">
      {/* הצגת תבניות רק בעמוד "כל העובדים" */}
      {isShowingAllEmployees && (
        <div>
          <TemplateDocumentsHeader
            uploading={templateUploading}
            handleTemplateUpload={handleTemplateUpload}
          />
          {templates.length > 0 ? (
            <div className="space-y-3">
              {templates.map((document: any) => (
                <EmployeeDocumentCard
                  key={document.id}
                  document={document}
                  canEdit={canEdit}
                  uploading={false}
                  reminderLoading={null}
                  reminderLog={{}}
                  handleView={handleView}
                  handleDownload={handleDownload}
                  handleDelete={handleDelete}
                  sendReminder={() => {}}
                  fetchReminders={async () => {}}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                אין תבניות מסמכים עדיין. הוסף תבנית חדשה למעלה.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* מסמכים רגילים */}
      <div>
        {!isShowingAllEmployees && (
          <EmployeeDocumentsHeader
            canEdit={canEdit}
            uploading={uploading}
            handleFileUpload={handleFileUpload}
            disableUpload={uploading}
          />
        )}
        
        {isShowingAllEmployees && (
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">מסמכי עובדים</h3>
          </div>
        )}

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
                {canEdit && !document.assignee && !document.is_template && (
                  <AssignToEmployeeSelect
                    docId={document.id}
                    employees={employees ?? []}
                    assigningId={assigningId}
                    uploading={uploading}
                    onAssign={handleAssignAssignee}
                  />
                )}
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
                disableUpload={uploading}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
