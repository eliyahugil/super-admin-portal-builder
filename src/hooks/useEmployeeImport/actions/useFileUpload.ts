
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
      console.log('📁 File details:', {
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type,
        lastModified: new Date(uploadedFile.lastModified).toISOString()
      });
      
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

      console.log('✅ Authentication confirmed:', {
        userId: user.id,
        email: user.email
      });

      setFile(uploadedFile);
      
      // Show loading state
      toast({
        title: 'מעלה קובץ...',
        description: 'מעלה את הקובץ לשרת ומעבד את הנתונים',
      });
      
      // Parse the Excel file first (this is the main functionality we need)
      console.log('📄 Starting Excel file parsing...');
      const parsedData = await ExcelImportService.parseExcelFile(uploadedFile);
      
      console.log('📊 Excel parsing completed:', {
        headersCount: parsedData.headers.length,
        dataRowsCount: parsedData.data.length,
        headers: parsedData.headers,
        firstRowSample: parsedData.data[0] || 'No data rows'
      });
      
      if (parsedData.headers.length === 0) {
        console.error('❌ No headers found in file');
        throw new Error('הקובץ לא מכיל כותרות תקינות');
      }
      
      if (parsedData.data.length === 0) {
        console.error('❌ No data rows found in file');
        throw new Error('הקובץ לא מכיל נתונים');
      }
      
      // Try to upload the file to storage (optional - don't fail if it doesn't work)
      let uploadSuccess = false;
      try {
        console.log('📤 Attempting to upload file to Supabase storage...');
        
        // Check bucket access first
        const hasAccess = await StorageService.checkBucketAccess();
        if (hasAccess) {
          const filePath = await StorageService.uploadEmployeeFile(uploadedFile, user.id);
          console.log('✅ File uploaded to storage:', filePath);
          uploadSuccess = true;
        } else {
          console.warn('⚠️ No bucket access - continuing without storage upload');
        }
      } catch (uploadError) {
        console.warn('⚠️ Storage upload failed, continuing with Excel parsing only:', uploadError);
        // Continue with Excel parsing even if storage upload fails
      }
      
      console.log('📋 Setting parsed data to state...');
      console.log('🏷️ Headers being set:', parsedData.headers);
      console.log('📊 Raw data being set (first 3 rows):', parsedData.data.slice(0, 3));
      
      setHeaders(parsedData.headers);
      setRawData(parsedData.data);
      
      // Show success message
      const successMessage = uploadSuccess 
        ? `הקובץ הועלה לשרת ונמצאו ${parsedData.data.length} שורות נתונים`
        : `הקובץ נקרא בהצלחה ונמצאו ${parsedData.data.length} שורות נתונים`;
      
      toast({
        title: 'קובץ נקרא בהצלחה! 🎉',
        description: successMessage,
      });
      
      // CRITICAL: Open mapping dialog immediately with detailed logging
      console.log('🎯 About to open mapping dialog...');
      console.log('📋 Current state before opening mapping dialog:', {
        headersSet: parsedData.headers.length > 0,
        dataSet: parsedData.data.length > 0,
        willOpenDialog: true
      });
      
      setShowMappingDialog(true);
      
      console.log('✅ Mapping dialog opened successfully');
      console.log('📈 File processing completed successfully - should now see mapping dialog');
      
    } catch (error) {
      console.error('💥 File upload error:', error);
      console.error('📊 Error details:', {
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      });
      
      let errorMessage = 'שגיאה לא צפויה';
      if (error instanceof Error) {
        if (error.message.includes('Authentication') || error.message.includes('access_token')) {
          errorMessage = 'נדרש להתחבר מחדש למערכת';
        } else if (error.message.includes('size')) {
          errorMessage = 'הקובץ גדול מדי - מקסימום 10MB';
        } else if (error.message.includes('כותרות') || error.message.includes('נתונים')) {
          errorMessage = error.message;
        } else {
          errorMessage = 'שגיאה בעיבוד הקובץ - אנא ודא שהקובץ הוא Excel תקין';
        }
      }
      
      toast({
        title: 'שגיאה בעיבוד הקובץ',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Reset state on error
      console.log('🔄 Resetting state due to error...');
      setStep('upload');
      setFile(null);
      setRawData([]);
      setHeaders([]);
    }
  };

  return { handleFileUpload };
};
