
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';
import type { ImportStep } from '../types';

interface UseFileProcessingProps {
  businessId: string | null;
  setFile: (file: File | null) => void;
  setRawData: (data: any[]) => void;
  setHeaders: (headers: string[]) => void;
  setStep: (step: ImportStep) => void;
  setShowMappingDialog: (show: boolean) => void;
}

// File validation functions
const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];
  
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  const hasValidType = allowedTypes.includes(file.type);
  
  return hasValidExtension || hasValidType;
};

const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const useFileProcessing = ({
  businessId,
  setFile,
  setRawData,
  setHeaders,
  setStep,
  setShowMappingDialog,
}: UseFileProcessingProps) => {
  const { toast } = useToast();

  const processFile = useCallback(async (file: File) => {
    console.log('🔄 useFileProcessing - processFile called:', {
      fileName: file.name,
      fileSize: file.size,
      businessId
    });

    // Check if business is selected (critical for import)
    if (!businessId) {
      console.error('❌ No business ID available for import');
      toast({
        title: 'יש לבחור עסק',
        description: 'אנא בחר עסק ספציפי מהרשימה כדי לייבא עובדים אליו. כמנהל ראשי, עליך לבחור לאיזה עסק להוסיף את העובדים.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!validateFileType(file)) {
      toast({
        title: 'שגיאה',
        description: 'סוג קובץ לא נתמך. אנא בחר קובץ Excel או CSV תקין (.xlsx, .xls, .csv)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB limit)
    if (!validateFileSize(file, 10)) {
      toast({
        title: 'שגיאה',
        description: 'הקובץ גדול מדי. הגודל המקסימלי הוא 10MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('📄 Publishing Excel file...');
      
      setFile(file);
      
      toast({
        title: 'מעבד קובץ...',
        description: 'קורא ומנתח את נתוני האקסל',
      });
      
      // Use the correct parseFile method that returns ParsedExcelData
      const parsedData = await ExcelImportService.parseFile(file);
      
      console.log('📊 File parsed successfully:', {
        headersCount: parsedData.headers.length,
        rowsCount: parsedData.data.length,
        sampleHeaders: parsedData.headers.slice(0, 5)
      });

      if (parsedData.headers.length === 0) {
        toast({
          title: 'שגיאה',
          description: 'הקובץ ריק או לא מכיל כותרות',
          variant: 'destructive',
        });
        return;
      }

      if (parsedData.data.length === 0) {
        toast({
          title: 'שגיאה',
          description: 'הקובץ לא מכיל נתוני עובדים',
          variant: 'destructive',
        });
        return;
      }

      // Set the parsed data
      setRawData(parsedData.data);
      setHeaders(parsedData.headers);
      setStep('mapping');
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
  }, [businessId, setFile, setRawData, setHeaders, setStep, setShowMappingDialog, toast]);

  const downloadTemplate = useCallback(() => {
    console.log('📝 Downloading template...');
    ExcelImportService.generateTemplate();
  }, []);

  return {
    processFile,
    downloadTemplate,
  };
};
