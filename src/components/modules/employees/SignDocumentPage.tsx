
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DocumentHeader } from './sign-document/DocumentHeader';
import { DocumentDetailsCard } from './sign-document/DocumentDetailsCard';
import { DigitalSignatureForm } from './sign-document/DigitalSignatureForm';
import { SignedDocumentDisplay } from './sign-document/SignedDocumentDisplay';
import { ErrorDisplay } from './sign-document/ErrorDisplay';
import { LoadingDisplay } from './sign-document/LoadingDisplay';
import { useSignDocument } from './sign-document/useSignDocument';
import { isValidSignatureData } from './sign-document/types';

// עמוד חתימה דיגיטלית לעובדים - מותאם למובייל
export const SignDocumentPage: React.FC = () => {
  const { documentId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const { document, isLoading, error, isSigning, handleSign } = useSignDocument(documentId || '');

  if (isLoading) {
    return <LoadingDisplay />;
  }

  if (error || !document) {
    return (
      <ErrorDisplay 
        title="מסמך לא נמצא"
        message="המסמך שביקשת לחתום עליו לא נמצא או שאין לך הרשאה לצפות בו."
      />
    );
  }

  // בדיקה אם המסמך כבר נחתם על ידי העובד הנוכחי
  const isAlreadySigned = document.status === 'signed' && !!document.signed_at;
  
  // רק אם המסמך נחתם על ידי העובד הנוכחי, נציג את החתימה
  const signatureData = isAlreadySigned && isValidSignatureData(document.digital_signature_data) 
    ? document.digital_signature_data 
    : null;

  // מציאת מידע על שליחה מחתימות המסמך
  const documentSignature = document.signatures?.find((sig: any) => 
    sig.employee_id === document.employee_id
  );
  
  const sentAt = documentSignature?.sent_at || document.created_at;
  const sentTo = document.employee ? 
    `${document.employee.first_name} ${document.employee.last_name}${document.employee.employee_id ? ` (${document.employee.employee_id})` : ''}` 
    : 'עובד לא זמין';

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Container מותאם למובייל */}
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
        <div className="space-y-4 md:space-y-6">
          <DocumentHeader 
            title="חתימה דיגיטלית"
            subtitle="חתום על המסמך באופן דיגיטלי"
          />

          <DocumentDetailsCard 
            document={document}
            isAlreadySigned={isAlreadySigned}
            sentAt={sentAt}
            sentTo={sentTo}
          />

          {/* Document Preview עם תמיכה טובה יותר במובייל */}
          <div className="bg-white rounded-lg border p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4">תצוגת המסמך</h3>
            <div className="border rounded-lg overflow-hidden mb-4">
              <div className="w-full overflow-auto" style={{ maxHeight: '70vh' }}>
                <iframe
                  src={document.file_url}
                  className="w-full min-h-96 border-0"
                  title={document.document_name}
                  style={{ 
                    height: '600px',
                    minHeight: '400px'
                  }}
                />
              </div>
            </div>
            
            {/* Show signature within document only if THIS specific document instance is signed */}
            {isAlreadySigned && signatureData && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  ✅ המסמך נחתם - החתימה שלך מוצגת למטה:
                </h4>
                <div className="bg-white p-3 rounded border inline-block">
                  <img 
                    src={signatureData.signature_image} 
                    alt="חתימה דיגיטלית"
                    className="max-w-full h-auto"
                    style={{ maxHeight: '100px', maxWidth: '200px' }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  נחתם על ידי: {signatureData.signed_by || sentTo}
                </div>
                <div className="text-sm text-gray-600">
                  זמן חתימה: {document.signed_at && format(new Date(document.signed_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                </div>
              </div>
            )}
          </div>

          {!isAlreadySigned && (
            <DigitalSignatureForm 
              onSign={handleSign}
              isSigning={isSigning}
              employeeName={sentTo}
            />
          )}

          {isAlreadySigned && signatureData && (
            <SignedDocumentDisplay
              signatureData={signatureData}
              signedAt={document.signed_at}
            />
          )}
        </div>
      </div>
    </div>
  );
};
