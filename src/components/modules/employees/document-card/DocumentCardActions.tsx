
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, Trash2, Bell, CheckCircle2 } from 'lucide-react';
import { SendToSignatureButton } from '../SendToSignatureButton';

interface Props {
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

export const DocumentCardActions: React.FC<Props> = ({
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
  const isReminderLoading = reminderLoading === document.id;
  
  // עבור תבניות, תמיד נראה כפתור שליחה לחתימה
  // עבור מסמכים רגילים, נראה שליחה מחדש אם יש חתימות ממתינות
  const showSendToSignature = isTemplate || (canEdit && (!hasSignatures || hasPartialSignatures));
  const isAlreadyAssigned = !isTemplate && hasSignatures;

  console.log('🔍 DocumentCardActions - Render info:', {
    documentId: document.id,
    isTemplate,
    hasSignatures,
    hasPartialSignatures,
    showSendToSignature,
    isAlreadyAssigned,
    canEdit
  });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* כפתור צפייה */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onView(document)}
        className="flex items-center gap-1"
      >
        <Eye className="h-4 w-4" />
        צפה
      </Button>

      {/* כפתור הורדה */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDownload(document)}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        הורד
      </Button>

      {/* כפתור שליחה לחתימה - מוצג לתבניות או למסמכים עם חתימות חלקיות */}
      {showSendToSignature && (
        <SendToSignatureButton
          documentId={document.id}
          documentName={document.document_name}
          isAlreadyAssigned={isAlreadyAssigned}
          onSent={onDocumentUpdated}
          variant="default"
          size="sm"
        />
      )}

      {/* כפתור תזכורת - רק למסמכים שנשלחו לחתימה */}
      {!isTemplate && hasSignatures && !isSigned && canEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSendReminder(document)}
          disabled={isReminderLoading}
          className="flex items-center gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <Bell className="h-4 w-4" />
          {isReminderLoading ? 'שולח...' : 'תזכורת'}
        </Button>
      )}

      {/* כפתור מחיקה - רק אם יש הרשאות עריכה */}
      {canEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(document)}
          disabled={uploading}
          className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          מחק
        </Button>
      )}

      {/* אינדיקטור למסמך חתום */}
      {isSigned && !isTemplate && (
        <div className="flex items-center gap-1 text-green-600 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span>נחתם</span>
        </div>
      )}
    </div>
  );
};
