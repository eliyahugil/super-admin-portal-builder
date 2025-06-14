
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

// עמוד חתימה דיגיטלית לעובדים
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

  const isAlreadySigned = document.status === 'signed' || document.signed_at;
  const signatureData = isValidSignatureData(document.digital_signature_data) 
    ? document.digital_signature_data 
    : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4" dir="rtl">
      <div className="space-y-6">
        <DocumentHeader 
          title="חתימה דיגיטלית"
          subtitle="חתום על המסמך באופן דיגיטלי"
        />

        <DocumentDetailsCard 
          document={document}
          isAlreadySigned={isAlreadySigned}
        />

        {!isAlreadySigned && (
          <DigitalSignatureForm 
            onSign={handleSign}
            isSigning={isSigning}
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
  );
};
