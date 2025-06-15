
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, Upload, Trash2, UserPlus } from 'lucide-react';
import { SendToSignatureButton } from '../SendToSignatureButton';

interface DocumentCardActionsProps {
  document: any;
  canEdit: boolean;
  uploading: boolean;
  reminderLoading: string | null;
  shouldShowSendButton: boolean;
  hasSignatures: boolean;
  hasPartialSignatures: boolean;
  isSigned: boolean;
  isTemplate: boolean;
  onView: (document: any) => void;
  onDownload: (document: any) => void;
  onSendReminder: (document: any) => void;
  onDelete: (document: any) => void;
  onDocumentUpdated?: () => void;
}

export const DocumentCardActions: React.FC<DocumentCardActionsProps> = ({
  document,
  canEdit,
  uploading,
  reminderLoading,
  shouldShowSendButton,
  hasSignatures,
  hasPartialSignatures,
  isSigned,
  isTemplate,
  onView,
  onDownload,
  onSendReminder,
  onDelete,
  onDocumentUpdated
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onView(document)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDownload(document)}
      >
        <Download className="h-4 w-4" />
      </Button>
      
      {/* כפתור שליחה לחתימה */}
      {shouldShowSendButton && (
        <SendToSignatureButton
          documentId={document.id}
          documentName={document.document_name}
          onSent={onDocumentUpdated}
          variant={hasSignatures ? "outline" : "default"}
          size="sm"
          isAlreadyAssigned={hasSignatures}
          customButtonText={
            hasSignatures 
              ? hasPartialSignatures 
                ? "הוסף נמענים"
                : "שלח מחדש"
              : "שלח לחתימה"
          }
          customIcon={hasSignatures && hasPartialSignatures ? UserPlus : undefined}
        />
      )}
      
      {canEdit && !isSigned && !isTemplate && (
        <Button
          variant="outline"
          size="sm"
          disabled={reminderLoading === document.id}
          onClick={() => onSendReminder(document)}
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
          onClick={() => onDelete(document)}
          disabled={uploading}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
