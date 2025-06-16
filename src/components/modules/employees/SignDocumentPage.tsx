
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { DocumentHeader } from './sign-document/DocumentHeader';
import { DocumentDetailsCard } from './sign-document/DocumentDetailsCard';
import { DigitalSignatureForm } from './sign-document/DigitalSignatureForm';
import { SignedDocumentDisplay } from './sign-document/SignedDocumentDisplay';
import { ErrorDisplay } from './sign-document/ErrorDisplay';
import { LoadingDisplay } from './sign-document/LoadingDisplay';
import { DocumentSignatureOverlay } from './sign-document/DocumentSignatureOverlay';
import { useSignDocument } from './sign-document/useSignDocument';
import { useSignedDocumentGenerator } from './sign-document/useSignedDocumentGenerator';
import { isValidSignatureData } from './sign-document/types';

// עמוד חתימה דיגיטלית לעובדים - מותאם למובייל
export const SignDocumentPage: React.FC = () => {
  const { documentId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const { document, isLoading, error, isSigning, handleSign } = useSignDocument(documentId || '');
  const { generateAndSaveSignedDocument, isGenerating } = useSignedDocumentGenerator();

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

  const handleDocumentGenerated = async (signedDocumentBlob: Blob) => {
    if (!documentId) {
      console.error('❌ Missing document ID');
      return;
    }
    
    try {
      console.log('📁 Received signed document blob:', signedDocumentBlob.size, 'bytes');
      await generateAndSaveSignedDocument(
        documentId,
        signedDocumentBlob,
        document.document_name
      );
    } catch (error) {
      console.error('❌ Error saving signed document:', error);
    }
  };

  // URL להצגת המסמך החתום או המקורי
  const displayUrl = (document as any).signed_document_url || document.file_url;

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
            <h3 className="text-lg font-semibold mb-4">
              {isAlreadySigned ? 'המסמך החתום' : 'תצוגת המסמך'}
            </h3>
            
            {isGenerating && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-700">מייצר מסמך עם חתימה...</span>
                </div>
              </div>
            )}
            
            <div className="border rounded-lg overflow-hidden mb-4">
              <div className="w-full overflow-auto" style={{ maxHeight: '70vh' }}>
                <iframe
                  src={displayUrl}
                  className="w-full min-h-96 border-0"
                  title={document.document_name}
                  style={{ 
                    height: '600px',
                    minHeight: '400px'
                  }}
                />
              </div>
            </div>
            
            {isAlreadySigned && (document as any).signed_document_url && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                  ✅ מסמך חתום - החתימה שלך מוטמעת במסמך
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-700">
                    <span className="font-medium">נחתם על ידי:</span> {signatureData?.signed_by || sentTo}
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium">זמן חתימה:</span> 
                    <span className="font-semibold text-green-700 mr-2">
                      {document.signed_at && format(new Date(document.signed_at), 'dd/MM/yyyy בשעה HH:mm', { locale: he })}
                    </span>
                  </div>
                  <div className="text-green-600 text-sm mt-2">
                    החתימה, שם החותם וזמן החתימה מוטמעים במסמך עצמו
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hidden component for generating signed document - only if signed but no URL yet */}
          {isAlreadySigned && signatureData && !(document as any).signed_document_url && (
            <DocumentSignatureOverlay
              documentUrl={document.file_url}
              signatureData={signatureData}
              signedAt={document.signed_at}
              signedBy={signatureData.signed_by || sentTo}
              onDocumentGenerated={handleDocumentGenerated}
            />
          )}

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
