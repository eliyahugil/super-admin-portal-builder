
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExcelParserService, ExcelRow } from '@/services/ExcelImportService';
import type { ImportStep } from '@/hooks/useEmployeeImport/types';

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
      const isValid = ExcelParserService.validateFileFormat(uploadedFile);
      if (!isValid) {
        toast({
          title: 'שגיאה בקובץ',
          description: 'אנא בחר קובץ Excel או CSV תקין (.xlsx, .xls, .csv)',
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
        totalRows: parsedData.length,
        sample: parsedData.slice(0, 3)
      });

      if (parsedData.length === 0) {
        toast({
          title: 'קובץ ריק',
          description: 'הקובץ לא מכיל נתונים או שכל השורות ריקות',
          variant: 'destructive'
        });
        return;
      }

      // Extract headers from the first row
      const headers = Object.keys(parsedData[0] || {});
      
      setRawData(parsedData);
      setHeaders(headers);
      setStep('mapping');
      setShowMappingDialog(true);

      toast({
        title: 'קובץ נטען בהצלחה! 📄',
        description: `נמצאו ${parsedData.length} שורות נתונים`,
      });

    } catch (error) {
      console.error('💥 File upload error:', error);
      toast({
        title: 'שגיאה בטעינת הקובץ',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive'
      });
    }
  }, [setFile, setRawData, setHeaders, setStep, setShowMappingDialog, toast]);

  return {
    handleFileUpload,
  };
};

