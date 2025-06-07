
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';
import type { ImportStep } from '../types';
import type { ExcelRow } from '@/services/ExcelImportService';
import { useAuthUtils } from '../utils/authUtils';

interface UseFileUploadProps {
  setFile: (file: File | null) => void;
  setRawData: (data: ExcelRow[]) => void;
  setHeaders: (headers: string[]) => void;
  setStep: (step: ImportStep) => void;
  setShowMappingDialog: (show: boolean) => void;
}

export const useFileUpload = ({
  setFile,
  setRawData,
  setHeaders,
  setStep,
  setShowMappingDialog,
}: UseFileUploadProps) => {
  const { toast } = useToast();
  const { checkAuthSession } = useAuthUtils();

  const handleFileUpload = async (uploadedFile: File) => {
    try {
      console.log('🚀 Starting file upload process for:', uploadedFile.name);
      
      // Check authentication before proceeding
      const isAuthenticated = await checkAuthSession();
      if (!isAuthenticated) {
        console.error('❌ Authentication failed, stopping upload');
        return;
      }

      console.log('✅ Authentication confirmed, proceeding with file processing');
      setFile(uploadedFile);
      
      console.log('📄 Parsing Excel file...');
      const parsedData = await ExcelImportService.parseExcelFile(uploadedFile);
      console.log('✅ Excel file parsed successfully:', {
        headers: parsedData.headers.length,
        rows: parsedData.data.length
      });
      
      if (parsedData.headers.length === 0) {
        throw new Error('הקובץ לא מכיל כותרות תקינות');
      }
      
      if (parsedData.data.length === 0) {
        throw new Error('הקובץ לא מכיל נתונים');
      }
      
      console.log('📋 Setting headers and data...');
      setHeaders(parsedData.headers);
      setRawData(parsedData.data);
      
      // DON'T change step - stay on upload until mapping is confirmed
      console.log('📋 Opening mapping dialog...');
      setShowMappingDialog(true);
      
      console.log('✅ File upload process completed successfully');
    } catch (error) {
      console.error('💥 File upload error:', error);
      toast({
        title: 'שגיאה בקריאת הקובץ',
        description: error instanceof Error ? error.message : 'אנא ודא שהקובץ הוא Excel תקין',
        variant: 'destructive'
      });
      
      // Reset state on error
      setStep('upload');
      setFile(null);
      setRawData([]);
      setHeaders([]);
    }
  };

  return { handleFileUpload };
};
