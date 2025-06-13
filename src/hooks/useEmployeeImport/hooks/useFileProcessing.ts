
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';
import { validateFileSize, validateFileType } from '@/utils/employeeValidation';
import type { ImportStep } from '../types';

interface UseFileProcessingProps {
  businessId: string | null;
  setFile: (file: File | null) => void;
  setRawData: (data: any[]) => void;
  setHeaders: (headers: string[]) => void;
  setStep: (step: ImportStep) => void;
  setShowMappingDialog: (show: boolean) => void;
}

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

    // Check if business is selected (important for import)
    if (!businessId) {
      console.error('❌ No business ID available for import');
      toast({
        title: 'שגיאה',
        description: 'יש לבחור עסק לפני ייבוא עובדים',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!validateFileType(file)) {
      toast({
        title: 'שגיאה',
        description: 'סוג קובץ לא נתמך. אנא בחר קובץ Excel (.xlsx או .xls)',
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
      console.log('📄 Parsing Excel file...');
      
      const parsedData = await ExcelImportService.parseExcelFile(file);
      
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

      // Update state with parsed data
      setFile(file);
      setRawData(parsedData.data);
      setHeaders(parsedData.headers);
      
      // Show mapping dialog
      setStep('mapping');
      setShowMappingDialog(true);

      console.log('✅ File processing completed, showing mapping dialog');

    } catch (error) {
      console.error('💥 Error processing file:', error);
      
      toast({
        title: 'שגיאה בעיבוד הקובץ',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה בעיבוד הקובץ',
        variant: 'destructive',
      });
    }
  }, [businessId, setFile, setRawData, setHeaders, setStep, setShowMappingDialog, toast]);

  const downloadTemplate = useCallback(() => {
    console.log('📥 Downloading employee import template');
    
    try {
      ExcelImportService.generateTemplate();
      
      toast({
        title: 'הצלחה',
        description: 'תבנית הייבוא הורדה בהצלחה',
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להוריד את תבנית הייבוא',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    processFile,
    downloadTemplate,
  };
};
