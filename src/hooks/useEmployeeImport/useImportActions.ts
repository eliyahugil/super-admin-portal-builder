
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';
import type { ImportStep, ImportActions } from './types';
import type { ExcelRow, PreviewEmployee, ImportResult } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';
import { employeeTypes, initialImportResult } from './constants';

interface UseImportActionsProps {
  businessId: string | null;
  rawData: ExcelRow[];
  branches: any[];
  existingEmployees: any[];
  previewData: PreviewEmployee[];
  setStep: (step: ImportStep) => void;
  setFile: (file: File | null) => void;
  setRawData: (data: ExcelRow[]) => void;
  setHeaders: (headers: string[]) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setPreviewData: (data: PreviewEmployee[]) => void;
  setIsImporting: (importing: boolean) => void;
  setShowMappingDialog: (show: boolean) => void;
  setImportResult: (result: ImportResult) => void;
}

export const useImportActions = ({
  businessId,
  rawData,
  branches,
  existingEmployees,
  previewData,
  setStep,
  setFile,
  setRawData,
  setHeaders,
  setFieldMappings,
  setPreviewData,
  setIsImporting,
  setShowMappingDialog,
  setImportResult,
}: UseImportActionsProps): ImportActions => {
  const { toast } = useToast();

  const handleFileUpload = async (uploadedFile: File) => {
    try {
      setFile(uploadedFile);
      const parsedData = await ExcelImportService.parseExcelFile(uploadedFile);
      
      setHeaders(parsedData.headers);
      setRawData(parsedData.data);
      setStep('mapping');
      setShowMappingDialog(true);
    } catch (error) {
      toast({
        title: 'שגיאה בקריאת הקובץ',
        description: error instanceof Error ? error.message : 'אנא ודא שהקובץ הוא Excel תקין',
        variant: 'destructive'
      });
    }
  };

  const handleMappingConfirm = (mappings: FieldMapping[]) => {
    if (!businessId) return;
    
    setFieldMappings(mappings);
    setShowMappingDialog(false);
    
    const preview = ExcelImportService.generatePreview(
      rawData,
      mappings,
      businessId,
      branches,
      existingEmployees,
      employeeTypes
    );
    
    setPreviewData(preview);
    setStep('preview');
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      const result = await ExcelImportService.importEmployees(previewData);
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: 'ייבוא הושלם בהצלחה',
          description: result.message,
        });
      } else {
        toast({
          title: 'שגיאה בייבוא',
          description: result.message,
          variant: 'destructive'
        });
      }
      
      setStep('summary');
    } catch (error) {
      const errorResult: ImportResult = {
        success: false,
        importedCount: 0,
        errorCount: previewData.length,
        message: 'שגיאה לא צפויה - אנא נסה שוב'
      };
      setImportResult(errorResult);
      setStep('summary');
      
      toast({
        title: 'שגיאה לא צפויה',
        description: 'אנא נסה שוב',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setFieldMappings([]);
    setPreviewData([]);
    setImportResult(initialImportResult);
  };

  const downloadTemplate = () => {
    ExcelImportService.generateTemplate();
  };

  return {
    handleFileUpload,
    handleMappingConfirm,
    handleImport,
    resetForm,
    downloadTemplate,
    setShowMappingDialog,
  };
};
