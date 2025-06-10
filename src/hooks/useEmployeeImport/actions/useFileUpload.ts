
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';

interface UseFileUploadProps {
  setFile: (file: File | null) => void;
  setRawData: (data: any[]) => void;
  setHeaders: (headers: string[]) => void;
  setStep: (step: any) => void;
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

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setFile(file);
      
      toast({
        title: 'מעלה קובץ...',
        description: 'מעבד את הקובץ, אנא המתן',
      });

      const result = await ExcelImportService.parseExcelFile(file);
      
      if (!result.data || result.data.length === 0) {
        throw new Error('הקובץ ריק או לא תקין');
      }

      setRawData(result.data);
      setHeaders(result.headers);
      setShowMappingDialog(true);
      setStep('mapping');

      toast({
        title: 'הקובץ עלה בהצלחה! 📊',
        description: `נמצאו ${result.data.length} שורות`,
      });

    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'שגיאה בהעלאת הקובץ',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive'
      });
      setFile(null);
    }
  }, [toast, setFile, setRawData, setHeaders, setStep, setShowMappingDialog]);

  return { handleFileUpload };
};
