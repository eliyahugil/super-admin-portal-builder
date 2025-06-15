
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Upload, Trash2, CheckCircle, Users, UserPlus } from 'lucide-react';
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
          <div className="flex items-center gap-3 flex-1">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="flex-1">
              <h4 className="font-medium">{document.document_name}</h4>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge className={getDocumentTypeColor(document.document_type)}>
                  {getDocumentTypeLabel(document.document_type)}
                </Badge>
                {isTemplate && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    תבנית
                  </Badge>
                )}
                {document.status && !isTemplate && (
                  <Badge className={getStatusColor(document.status)}>{getStatusLabel(document.status)}</Badge>
                )}
                {isSigned && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    נחתם
                  </Badge>
                )}
                
                {/* הצגת מידע על נמענים וחתימות - עם פירוט טוב יותר */}
                {recipientsCount > 0 && !isTemplate && (
                  <div className="flex items-center gap-1">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      <Users className="h-3 w-3 mr-1" />
                      {signedCount}/{recipientsCount} חתמו
                    </Badge>
                    
                    {/* אם יש חתימות חלקיות - הצגת סטטוס מפורט */}
                    {hasPartialSignatures && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        חתימה חלקית
                      </Badge>
                    )}
                    
                    {/* אם כל החתימות הושלמו */}
                    {hasSignatures && signedCount === recipientsCount && recipientsCount > 0 && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        הושלם
                      </Badge>
                    )}
                  </div>
                )}
                
                <span className="text-sm text-gray-500">
                  {format(new Date(document.created_at), 'dd/MM/yyyy', { locale: he })}
                </span>
                {document.uploaded_by_profile?.full_name && (
                  <span className="text-sm text-gray-500">
                    • הועלה על ידי {document.uploaded_by_profile.full_name}
                  </span>
                )}
                
                {/* הצגת רשימת חתימות מפורטת */}
                {hasSignatures && !isTemplate && (
                  <div className="w-full mt-2">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-700 hover:text-blue-800">
                        רשימת חתימות ({document.signatures.length})
                      </summary>
                      <div className="mt-2 space-y-1 bg-gray-50 rounded p-2">
                        {/* חתימות שהושלמו */}
                        {completedSignatures.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-green-700 mb-1">✅ חתמו ({completedSignatures.length}):</div>
                            {completedSignatures.map((sig: any) => (
                              <div key={sig.id} className="flex items-center justify-between text-xs bg-green-50 rounded px-2 py-1">
                                <span>
                                  {sig.employee?.first_name} {sig.employee?.last_name}
                                  {sig.employee?.employee_id && ` (${sig.employee.employee_id})`}
                                </span>
                                <span className="text-green-600 text-xs">
                                  {sig.signed_at && format(new Date(sig.signed_at), 'dd/MM HH:mm', { locale: he })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* חתימות ממתינות */}
                        {pendingSignatures.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-orange-700 mb-1">⏳ ממתינים ({pendingSignatures.length}):</div>
                            {pendingSignatures.map((sig: any) => (
                              <div key={sig.id} className="flex items-center justify-between text-xs bg-orange-50 rounded px-2 py-1">
                                <span>
                                  {sig.employee?.first_name} {sig.employee?.last_name}
                                  {sig.employee?.employee_id && ` (${sig.employee.employee_id})`}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  ממתין
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}
                
                {document.signed_at && !isTemplate && (
                  <span className="text-sm text-green-700 bg-green-50 px-2 py-0.5 rounded ml-1">
                    נחתם ב: {format(new Date(document.signed_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                  </span>
                )}
                {typeof document.reminder_count === 'number' && !isTemplate && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded ml-1">
                    תזכורות: {document.reminder_count}
                  </span>
                )}
                {document.reminder_sent_at && !isTemplate && (
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
            
            {/* כפתור שליחה לחתימה - עם הבחנה בין שליחה ראשונה להוספת נמענים */}
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
                      ? "הוסף נמענים"  // יש חתימות חלקיות
                      : "שלח מחדש"      // כל החתימות הושלמו או כולן ממתינות
                    : "שלח לחתימה"    // אין חתימות כלל
                }
                customIcon={hasSignatures && hasPartialSignatures ? UserPlus : undefined}
              />
            )}
            
            {canEdit && !isSigned && !isTemplate && (
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
