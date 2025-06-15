
import React from 'react';
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
}

export const EmployeeDocumentsList: React.FC<Props> = ({
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
  onDocumentUpdated
}) => {
  return (
    <div className="space-y-4">
      {documents.map((document) => (
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
  );
};
