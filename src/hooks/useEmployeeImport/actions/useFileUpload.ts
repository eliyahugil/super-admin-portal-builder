
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExcelParserService } from '@/services/excel/ExcelParserService';
import type { ExcelRow, ImportStep } from '@/hooks/useEmployeeImport/types';

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

  const handleFileUpload = useCallback(async (uploadedFile: File) => {
    try {
      console.log('🚀 Starting file upload process for:', uploadedFile.name);
      
      // Validate file format
      const validation = ExcelParserService.validateFileFormat(uploadedFile);
      if (!validation.isValid) {
        toast({
          title: 'שגיאה בקובץ',
          description: validation.error,
          variant: 'destructive'
        });
        return;
      }

      setFile(uploadedFile);
      
      toast({
        title: 'מעבד קובץ...',
        description: 'קורא ומנתח את נתוני האקסל',
      });

      const parsedData = await ExcelParserService.parseExcelFile(uploadedFile);
      
      console.log('📊 Parsed Excel data:', {
        totalRows: parsedData.data.length,
        headers: parsedData.headers.length,
        sample: parsedData.data.slice(0, 3)
      });

      if (parsedData.data.length === 0) {
        toast({
          title: 'קובץ ריק',
          description: 'הקובץ לא מכיל נתונים או שכל השורות ריקות',
          variant: 'destructive'
        });
        return;
      }

      setRawData(parsedData.data);
      setHeaders(parsedData.headers);
      setShowMappingDialog(true);

      toast({
        title: 'קובץ נטען בהצלחה! 📄',
        description: `נמצאו ${parsedData.data.length} שורות נתונים`,
      });

    } catch (error) {
      console.error('💥 File upload error:', error);
      toast({
        title: 'שגיאה בטעינת הקובץ',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive'
      });
    }
  }, [setFile, setRawData, setHeaders, setShowMappingDialog, toast]);

  return {
    handleFileUpload,
  };
};
