
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Upload, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  getStatusColor,
  getStatusLabel,
  getDocumentTypeColor,
  getDocumentTypeLabel
} from './helpers/documentHelpers';
import { EmployeeDocumentReminders } from './EmployeeDocumentReminders';
import { SendToSignatureButton } from './SendToSignatureButton';

interface Props {
  document: any;
  canEdit: boolean;
  uploading: boolean;
  reminderLoading: string | null;
  reminderLog: Record<string, any[]>;
  handleView: (document: any) => void;
  handleDownload: (document: any) => void;
  handleDelete: (document: any) => void;
  sendReminder: (doc: any) => void;
  fetchReminders: (docId: string) => Promise<void>;
  onDocumentUpdated?: () => void;
}

export const EmployeeDocumentCard: React.FC<Props> = ({
  document,
  canEdit,
  uploading,
  reminderLoading,
  reminderLog,
  handleView,
  handleDownload,
  handleDelete,
  sendReminder,
  fetchReminders,
  onDocumentUpdated
}) => {
  const isSigned = document.status === 'signed' || document.signed_at;
  const hasAssignee = !!document.assignee;

  console.log('📋 EmployeeDocumentCard - Document info:', {
    id: document.id,
    name: document.document_name,
    isTemplate: document.is_template,
    hasAssignee,
    canEdit,
    shouldShowButton: canEdit && !document.is_template
  });

  return (
    <Card key={document.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 flex-1">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="flex-1">
              <h4 className="font-medium">{document.document_name}</h4>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge className={getDocumentTypeColor(document.document_type)}>
                  {getDocumentTypeLabel(document.document_type)}
                </Badge>
                {document.status && (
                  <Badge className={getStatusColor(document.status)}>{getStatusLabel(document.status)}</Badge>
                )}
                {isSigned && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    נחתם
                  </Badge>
                )}
                <span className="text-sm text-gray-500">
                  {format(new Date(document.created_at), 'dd/MM/yyyy', { locale: he })}
                </span>
                {document.uploaded_by_profile?.full_name && (
                  <span className="text-sm text-gray-500">
                    • הועלה על ידי {document.uploaded_by_profile.full_name}
                  </span>
                )}
                {/* Show assignee if available */}
                {document.assignee && (
                  <span className="text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded ml-1">
                    מיועד לחתימה: {document.assignee.first_name} {document.assignee.last_name} ({document.assignee.employee_id || ''})
                  </span>
                )}
                {document.signed_at && (
                  <span className="text-sm text-green-700 bg-green-50 px-2 py-0.5 rounded ml-1">
                    נחתם ב: {format(new Date(document.signed_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                  </span>
                )}
                {typeof document.reminder_count === 'number' && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded ml-1">
                    תזכורות: {document.reminder_count}
                  </span>
                )}
                {document.reminder_sent_at && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded ml-1">
                    עודכן לאחרונה: {format(new Date(document.reminder_sent_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleView(document)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(document)}
            >
              <Download className="h-4 w-4" />
            </Button>
            
            {/* כפתור שליחה לחתימה - מציג תמיד עבור מסמכים שאינם תבניות אם יש הרשאת עריכה */}
            {canEdit && !document.is_template && (
              <SendToSignatureButton
                documentId={document.id}
                documentName={document.document_name}
                onSent={onDocumentUpdated}
                variant={hasAssignee ? "ghost" : "default"}
                size="sm"
                isAlreadyAssigned={hasAssignee}
              />
            )}
            
            {canEdit && !isSigned && (
              <Button
                variant="outline"
                size="sm"
                disabled={reminderLoading === document.id}
                onClick={() => sendReminder(document)}
                className="text-purple-600 hover:text-purple-700"
                title="שלח תזכורת לעובד"
              >
                {reminderLoading === document.id
                  ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                  : <Upload className="h-4 w-4" />}
                שלח תזכורת
              </Button>
            )}
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(document)}
                disabled={uploading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <EmployeeDocumentReminders
          docId={document.id}
          reminderLog={reminderLog}
          fetchReminders={fetchReminders}
        />
      </CardContent>
    </Card>
  );
};
