
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  getStatusColor,
  getStatusLabel,
  getDocumentTypeColor,
  getDocumentTypeLabel
} from '../helpers/documentHelpers';

interface DocumentCardBadgesProps {
  document: any;
  isSigned: boolean;
  isTemplate: boolean;
  recipientsCount: number;
  signedCount: number;
  hasPartialSignatures: boolean;
  hasSignatures: boolean;
}

export const DocumentCardBadges: React.FC<DocumentCardBadgesProps> = ({
  document,
  isSigned,
  isTemplate,
  recipientsCount,
  signedCount,
  hasPartialSignatures,
  hasSignatures
}) => {
  // קביעת הסטטוס הנכון על בסיס כל המידע הזמין
  const actualStatus = isSigned || 
                      document.signed_at || 
                      document.digital_signature_data ||
                      document.signed_document_url ? 'signed' : document.status;

  return (
    <>
      <Badge className={getDocumentTypeColor(document.document_type)}>
        {getDocumentTypeLabel(document.document_type)}
      </Badge>
      
      {isTemplate && (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
          תבנית
        </Badge>
      )}
      
      {actualStatus && !isTemplate && (
        <Badge className={getStatusColor(actualStatus)}>
          {getStatusLabel(actualStatus)}
        </Badge>
      )}
      
      {isSigned && (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          נחתם
        </Badge>
      )}
      
      {/* הצגת מידע על נמענים וחתימות */}
      {recipientsCount > 0 && !isTemplate && (
        <div className="flex items-center gap-1">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Users className="h-3 w-3 mr-1" />
            {signedCount}/{recipientsCount} חתמו
          </Badge>
          
          {hasPartialSignatures && (
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              חתימה חלקית
            </Badge>
          )}
          
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
    </>
  );
};
