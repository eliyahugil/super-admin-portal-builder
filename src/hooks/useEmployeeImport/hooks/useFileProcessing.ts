
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';
import type { ExcelRow, ImportStep } from '../types';

interface UseFileProcessingProps {
  businessId: string | null;
  setFile: (file: File | null) => void;
  setRawData: (data: ExcelRow[]) => void;
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

  const processFile = useCallback(async (selectedFile: File) => {
    console.log('🎯 Processing file:', selectedFile.name);
    
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    try {
      setFile(selectedFile);
      setStep('mapping');

      // Parse Excel file
      const parsedData = await ExcelImportService.parseExcelFile(selectedFile);
      console.log('📊 Parsed data:', parsedData);

      // Extract headers from the first row
      const extractedHeaders = Object.keys(parsedData[0] || {});

      setRawData(parsedData);
      setHeaders(extractedHeaders);
      setShowMappingDialog(true);

    } catch (error) {
      console.error('💥 Error processing file:', error);
      toast({
        title: 'שגיאה בעיבוד הקובץ',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive',
      });
    }
  }, [businessId, setFile, setStep, setRawData, setHeaders, setShowMappingDialog, toast]);

  const downloadTemplate = useCallback(() => {
    try {
      ExcelImportService.generateTemplate();
      toast({
        title: 'הצלחה',
        description: 'קובץ התבנית הורד בהצלחה',
      });
    } catch (error) {
      console.error('💥 Error downloading template:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בהורדת קובץ התבנית',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    processFile,
    downloadTemplate,
  };
};
