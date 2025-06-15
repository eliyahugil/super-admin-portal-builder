
import { supabase } from '@/integrations/supabase/client';
import { EmployeeFile, SignedDocument } from '../types';

export const useFileActions = () => {
  const handleDownload = async (file: EmployeeFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDownloadSignedDocument = async (doc: SignedDocument) => {
    try {
      // For signed documents, we open the file URL directly
      window.open(doc.file_url, '_blank');
    } catch (error) {
      console.error('Download signed document error:', error);
    }
  };

  return {
    handleDownload,
    handleDownloadSignedDocument,
  };
};
