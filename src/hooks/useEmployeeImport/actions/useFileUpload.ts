
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';
import { StorageService } from '@/services/StorageService';
import { supabase } from '@/integrations/supabase/client';
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('משתמש לא מחובר');
      }

      console.log('✅ Authentication confirmed, proceeding with file processing');
      setFile(uploadedFile);
      
      // Show loading state
      toast({
        title: 'מעלה קובץ...',
        description: 'מעלה את הקובץ לשרת ומעבד את הנתונים',
      });
      
      // First upload the file to storage using the StorageService
      console.log('📤 Uploading file to Supabase storage...');
      const filePath = await StorageService.uploadEmployeeFile(uploadedFile, user.id);
      
      console.log('✅ File uploaded to storage:', filePath);
      
      // Then parse the Excel file
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
      
      // Show success message
      toast({
        title: 'קובץ הועלה ונקרא בהצלחה! 🎉',
        description: `הקובץ הועלה לשרת ונמצאו ${parsedData.data.length} שורות נתונים`,
      });
      
      // Open mapping dialog immediately
      console.log('📋 Opening mapping dialog...');
      setShowMappingDialog(true);
      
      console.log('✅ File upload and processing completed successfully');
    } catch (error) {
      console.error('💥 File upload error:', error);
      
      let errorMessage = 'שגיאה לא צפויה';
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('bucket')) {
          errorMessage = 'שגיאה באחסון הקבצים - אנא פנה למנהל המערכת';
        } else if (error.message.includes('Authentication')) {
          errorMessage = 'נדרש להתחבר מחדש למערכת';
        } else if (error.message.includes('size')) {
          errorMessage = 'הקובץ גדול מדי - מקסימום 10MB';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'שגיאה בהעלאת הקובץ',
        description: errorMessage,
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
