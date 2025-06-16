
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSignedDocumentGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateAndSaveSignedDocument = async (
    documentId: string,
    signedDocumentBlob: Blob,
    originalDocumentName: string
  ) => {
    setIsGenerating(true);
    
    try {
      console.log('🔄 Generating signed document file...');
      
      // Create filename for signed document
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const signedFileName = `signed-${timestamp}-${originalDocumentName}`;
      const filePath = `signed-documents/${documentId}/${signedFileName}`;
      
      // Upload signed document to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, signedDocumentBlob, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Error uploading signed document:', uploadError);
        throw uploadError;
      }

      console.log('✅ Signed document uploaded successfully:', uploadData.path);

      // Get public URL for the signed document
      const { data: urlData } = supabase.storage
        .from('employee-files')
        .getPublicUrl(filePath);

      // Update the document record with the signed document URL
      const { error: updateError } = await supabase
        .from('employee_documents')
        .update({
          signed_document_url: urlData.publicUrl
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('❌ Error updating document with signed URL:', updateError);
        throw updateError;
      }

      console.log('✅ Document updated with signed document URL');
      
      toast({
        title: 'הצלחה',
        description: 'המסמך עם החתימה נוצר ונשמר בהצלחה',
      });

      return urlData.publicUrl;
      
    } catch (error: any) {
      console.error('❌ Error generating signed document:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן ליצור את המסמך עם החתימה',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateAndSaveSignedDocument,
    isGenerating
  };
};
