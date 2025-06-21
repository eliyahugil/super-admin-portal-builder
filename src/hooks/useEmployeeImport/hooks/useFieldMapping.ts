
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';
import type { ImportStep, FieldMapping, PreviewEmployee } from '../types';

interface UseFieldMappingProps {
  businessId: string | null;
  rawData: any[];
  branches: Array<{ id: string; name: string }>;
  existingEmployees: Array<{ email?: string; id_number?: string; employee_id?: string }>;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setPreviewData: (data: PreviewEmployee[]) => void;
  setStep: (step: ImportStep) => void;
  setShowMappingDialog: (show: boolean) => void;
}

export const useFieldMapping = ({
  businessId,
  rawData,
  branches,
  existingEmployees,
  setFieldMappings,
  setPreviewData,
  setStep,
  setShowMappingDialog,
}: UseFieldMappingProps) => {
  const { toast } = useToast();

  const confirmMapping = useCallback(async (fieldMappings: FieldMapping[]): Promise<void> => {
    console.log('🗺️ useFieldMapping - confirmMapping called:', {
      fieldMappings,
      rawDataCount: rawData.length,
      businessId
    });

    if (!businessId) {
      console.error('❌ No business ID available for mapping');
      toast({
        title: 'שגיאה',
        description: 'יש לבחור עסק לפני המשך הייבוא',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Convert FieldMapping[] to Record<string, string> for the service
      const mappingRecord: Record<string, string> = {};
      fieldMappings.forEach(mapping => {
        if (mapping.systemField && mapping.mappedColumns.length > 0) {
          mappingRecord[mapping.systemField] = mapping.mappedColumns[0];
        }
      });

      // Generate preview data using the service
      const previewData = await ExcelImportService.generatePreview({
        rawData,
        fieldMappings: mappingRecord,
        businessId,
        branches,
        existingEmployees
      });

      console.log('📊 Preview data generated:', {
        previewCount: previewData.length,
        validCount: previewData.filter(emp => emp.isValid).length,
        duplicateCount: previewData.filter(emp => emp.isDuplicate).length
      });

      // Update state
      setFieldMappings(fieldMappings);
      setPreviewData(previewData);
      setShowMappingDialog(false);
      setStep('preview');

      toast({
        title: 'מיפוי שדות הושלם',
        description: `נוצרה תצוגה מקדימה של ${previewData.length} עובדים`,
      });

    } catch (error) {
      console.error('💥 Error in confirmMapping:', error);
      
      toast({
        title: 'שגיאה במיפוי שדות',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה במיפוי השדות',
        variant: 'destructive',
      });
    }
  }, [businessId, rawData, branches, existingEmployees, setFieldMappings, setPreviewData, setStep, setShowMappingDialog, toast]);

  return {
    confirmMapping,
  };
};
