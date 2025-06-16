
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
      console.log('📁 Document ID:', documentId);
      console.log('📄 Original name:', originalDocumentName);
      console.log('💾 Blob size:', signedDocumentBlob.size);
      
      // Validate inputs
      if (!documentId || !signedDocumentBlob || signedDocumentBlob.size === 0) {
        throw new Error('נתונים חסרים או לא תקינים לשמירת המסמך');
      }
      
      // Create filename for signed document
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileExtension = originalDocumentName.split('.').pop() || 'png';
      const cleanName = originalDocumentName.replace(/\.[^/.]+$/, ''); // Remove extension
      const signedFileName = `signed-${timestamp}-${cleanName}.${fileExtension}`;
      const filePath = `signed-documents/${documentId}/${signedFileName}`;
      
      console.log('📂 File path:', filePath);
      
      // Upload signed document to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, signedDocumentBlob, {
          contentType: signedDocumentBlob.type || 'image/png',
          cacheControl: '3600',
          upsert: true // Allow overwriting
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error(`שגיאה בהעלאת המסמך: ${uploadError.message}`);
      }

      console.log('✅ Signed document uploaded successfully:', uploadData?.path);

      // Get public URL for the signed document
      const { data: urlData } = supabase.storage
        .from('employee-files')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('לא ניתן לקבל כתובת URL למסמך החתום');
      }

      console.log('🔗 Public URL generated:', urlData.publicUrl);

      // Update the document record with the signed document URL
      const { error: updateError } = await supabase
        .from('employee_documents')
        .update({
          signed_document_url: urlData.publicUrl,
          status: 'signed',
          signed_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('❌ Database update error:', updateError);
        throw new Error(`שגיאה בעדכון המסמך: ${updateError.message}`);
      }

      console.log('✅ Document updated with signed document URL');
      
      toast({
        title: 'הצלחה! 🎉',
        description: 'המסמך עם החתימה נוצר ונשמר בהצלחה',
      });

      return urlData.publicUrl;
      
    } catch (error: any) {
      console.error('❌ Error in generateAndSaveSignedDocument:', error);
      
      const errorMessage = error.message || 'שגיאה לא ידועה ביצירת המסמך';
      
      toast({
        title: 'שגיאה ביצירת המסמך',
        description: errorMessage,
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
