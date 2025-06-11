
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExcelParserService } from '@/services/excel/ExcelParserService';
import type { ExcelRow, ImportStep } from './types';

interface UseFileProcessingProps {
  businessId: string | null;
  setStep: (step: ImportStep) => void;
  setRawData: (data: ExcelRow[]) => void;
  setHeaders: (headers: string[]) => void;
  setShowMappingDialog: (show: boolean) => void;
}

export const useFileProcessing = ({
  businessId,
  setStep,
  setRawData,
  setHeaders,
  setShowMappingDialog,
}: UseFileProcessingProps) => {
  const { toast } = useToast();

  const processFile = useCallback(async (file: File) => {
    try {
      console.log('📁 Processing file:', file.name);
      
      if (!businessId) {
        toast({
          title: 'שגיאה',
          description: 'לא נמצא מזהה עסק',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'מעבד קובץ...',
        description: 'קורא נתונים מקובץ האקסל',
      });

      // Parse Excel file
      const parsedData = await ExcelParserService.parseFile(file);
      console.log('📊 Parsed data:', parsedData);

      if (!parsedData.data || parsedData.data.length === 0) {
        toast({
          title: 'קובץ ריק',
          description: 'הקובץ שנבחר ריק או לא מכיל נתונים',
          variant: 'destructive'
        });
        return;
      }

      if (!parsedData.headers || parsedData.headers.length === 0) {
        toast({
          title: 'שגיאה בפרסור',
          description: 'לא נמצאו כותרות בקובץ',
          variant: 'destructive'
        });
        return;
      }

      // Update state
      setRawData(parsedData.data);
      setHeaders(parsedData.headers);
      setShowMappingDialog(true);

      toast({
        title: 'קובץ נקרא בהצלחה! 📁',
        description: `נמצאו ${parsedData.data.length} שורות עם ${parsedData.headers.length} עמודות`,
      });

    } catch (error) {
      console.error('💥 File processing error:', error);
      toast({
        title: 'שגיאה בעיבוד הקובץ',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive'
      });
    }
  }, [businessId, setRawData, setHeaders, setShowMappingDialog, toast]);

  return {
    processFile,
  };
};
