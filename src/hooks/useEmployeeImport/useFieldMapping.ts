
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExcelFileManager } from '@/services/excel/ExcelFileManager';
import type { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';
import type { ExcelRow, PreviewEmployee, ImportStep } from './types';

interface UseFieldMappingProps {
  businessId: string | null;
  rawData: ExcelRow[];
  branches: any[];
  existingEmployees: any[];
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

  const confirmMapping = useCallback(async (mappings: FieldMapping[]) => {
    try {
      console.log('🔗 Confirming field mappings:', mappings);
      
      if (!businessId) {
        toast({
          title: 'שגיאה',
          description: 'לא נמצא מזהה עסק',
          variant: 'destructive'
        });
        return;
      }

      if (rawData.length === 0) {
        toast({
          title: 'שגיאה',
          description: 'אין נתונים לעיבוד',
          variant: 'destructive'
        });
        return;
      }

      setFieldMappings(mappings);

      toast({
        title: 'מעבד נתונים...',
        description: 'יוצר תצוגה מקדימה של העובדים',
      });

      // Generate preview data using the Excel File Manager
      const employeeTypes = [
        { value: 'permanent', label: 'קבוע' },
        { value: 'temporary', label: 'זמני' },
        { value: 'youth', label: 'נוער' },
        { value: 'contractor', label: 'קבלן' },
      ];

      const previewEmployees = ExcelFileManager.generatePreview(
        rawData,
        mappings,
        businessId,
        branches,
        existingEmployees,
        employeeTypes
      );

      console.log('👀 Generated preview data:', previewEmployees);
      setPreviewData(previewEmployees);
      setShowMappingDialog(false);
      setStep('preview');

      toast({
        title: 'תצוגה מקדימה מוכנה! 🎉',
        description: `נמצאו ${previewEmployees.length} עובדים לייבוא`,
      });

    } catch (error) {
      console.error('💥 Field mapping confirmation error:', error);
      toast({
        title: 'שגיאה במיפוי השדות',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive'
      });
    }
  }, [businessId, rawData, branches, existingEmployees, setFieldMappings, setPreviewData, setStep, setShowMappingDialog, toast]);

  return {
    confirmMapping,
  };
};
