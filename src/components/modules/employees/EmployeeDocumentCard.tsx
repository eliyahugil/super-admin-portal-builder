
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeeDocumentReminders } from './EmployeeDocumentReminders';
import { DocumentCardHeader } from './document-card/DocumentCardHeader';
import { DocumentCardBadges } from './document-card/DocumentCardBadges';
import { DocumentCardSignatureDetails } from './document-card/DocumentCardSignatureDetails';
import { DocumentCardActions } from './document-card/DocumentCardActions';

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
  // בדיקה מקיפה יותר לסטטוס החתימה
  const isSigned = document.status === 'signed' || 
                   document.signed_at || 
                   document.digital_signature_data ||
                   document.signed_document_url;
                   
  const hasSignatures = document.signatures && document.signatures.length > 0;
  const isTemplate = document.is_template;
  const recipientsCount = document.recipients_count || 0;
  const signedCount = document.signed_count || 0;
  
  // עבור תבניות, נראה את הכפתור תמיד. עבור מסמכים רגילים, נראה אותו רק אם יש הרשאה
  const shouldShowSendButton = canEdit && (isTemplate || !isTemplate);

  // בדיקה אם יש חתימות בהמתנה
  const pendingSignatures = document.signatures?.filter((sig: any) => sig.status === 'pending') || [];
  const completedSignatures = document.signatures?.filter((sig: any) => sig.status === 'signed') || [];
  const hasPartialSignatures = hasSignatures && completedSignatures.length > 0 && pendingSignatures.length > 0;

  console.log('📋 EmployeeDocumentCard - Document info:', {
    id: document.id,
    name: document.document_name,
    status: document.status,
    isSigned,
    signed_at: document.signed_at,
    has_signature_data: !!document.digital_signature_data,
    has_signed_url: !!document.signed_document_url,
    isTemplate,
    hasSignatures,
    recipientsCount,
    signedCount,
    pendingCount: pendingSignatures.length,
    completedCount: completedSignatures.length,
    hasPartialSignatures,
    canEdit,
    shouldShowSendButton
  });

  return (
    <Card key={document.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <DocumentCardHeader document={document}>
            <DocumentCardBadges
              document={document}
              isSigned={isSigned}
              isTemplate={isTemplate}
              recipientsCount={recipientsCount}
              signedCount={signedCount}
              hasPartialSignatures={hasPartialSignatures}
              hasSignatures={hasSignatures}
            />
            
            <DocumentCardSignatureDetails
              hasSignatures={hasSignatures}
              isTemplate={isTemplate}
              document={document}
              completedSignatures={completedSignatures}
              pendingSignatures={pendingSignatures}
            />
          </DocumentCardHeader>
          
          <DocumentCardActions
            document={document}
            canEdit={canEdit}
            uploading={uploading}
            reminderLoading={reminderLoading}
            shouldShowSendButton={shouldShowSendButton}
            hasSignatures={hasSignatures}
            hasPartialSignatures={hasPartialSignatures}
            isSigned={isSigned}
            isTemplate={isTemplate}
            onView={handleView}
            onDownload={handleDownload}
            onSendReminder={sendReminder}
            onDelete={handleDelete}
            onDocumentUpdated={onDocumentUpdated}
          />
        </div>
        
        {!isTemplate && (
          <EmployeeDocumentReminders
            docId={document.id}
            reminderLog={reminderLog}
            fetchReminders={fetchReminders}
          />
        )}
      </CardContent>
    </Card>
  );
};
