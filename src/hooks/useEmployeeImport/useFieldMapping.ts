
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';
import { employeeTypes } from './constants';
import type { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';
import type { ExcelRow, PreviewEmployee } from '@/services/ExcelImportService';

interface UseFieldMappingProps {
  businessId: string | null;
  rawData: ExcelRow[];
  branches: any[];
  existingEmployees: any[];
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setPreviewData: (data: PreviewEmployee[]) => void;
  setStep: (step: any) => void;
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
      console.log('🎯 Starting mapping confirmation with mappings:', mappings.length);
      
      if (!businessId) {
        toast({
          title: 'שגיאה',
          description: 'לא נמצא מזהה עסק',
          variant: 'destructive'
        });
        return;
      }

      setFieldMappings(mappings);
      setShowMappingDialog(false);

      toast({
        title: 'מעבד נתונים...',
        description: 'יוצר תצוגה מקדימה של הנתונים',
      });

      const preview = ExcelImportService.generatePreview(
        rawData,
        mappings,
        businessId,
        branches,
        existingEmployees,
        employeeTypes
      );

      console.log('✅ Preview generated successfully:', {
        totalRows: preview.length,
        validRows: preview.filter(p => p.isValid).length,
        errorRows: preview.filter(p => !p.isValid).length
      });

      setPreviewData(preview);
      setStep('preview');

      toast({
        title: 'תצוגה מקדימה מוכנה! 📊',
        description: `נמצאו ${preview.length} עובדים לעיון ואישור`,
      });

    } catch (error) {
      console.error('💥 Error in mapping confirmation:', error);
      toast({
        title: 'שגיאה במיפוי שדות',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive'
      });
    }
  }, [rawData, businessId, branches, existingEmployees, toast]);

  return {
    confirmMapping,
  };
};
