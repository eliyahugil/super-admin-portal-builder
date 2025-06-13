
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EmployeeDataTransformer } from '@/services/excel/EmployeeDataTransformer';
import type { 
  FieldMapping,
  ExcelRow,
  PreviewEmployee,
  ImportStep
} from '../types';

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
    console.log('🗺️ Confirming mappings:', mappings);
    
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    try {
      setFieldMappings(mappings);
      setShowMappingDialog(false);
      setStep('preview');

      // Generate preview data using the transformer
      const employeeTypes = [
        { value: 'permanent', label: 'קבוע' },
        { value: 'temporary', label: 'זמני' },
        { value: 'youth', label: 'נוער' },
        { value: 'contractor', label: 'קבלן' }
      ];

      const preview = EmployeeDataTransformer.generatePreview(
        rawData,
        mappings,
        businessId,
        branches,
        existingEmployees,
        employeeTypes
      );

      // Transform to match our PreviewEmployee type
      const transformedPreview: PreviewEmployee[] = preview.map(emp => ({
        first_name: emp.data.first_name,
        last_name: emp.data.last_name,
        email: emp.data.email,
        phone: emp.data.phone,
        id_number: emp.data.id_number,
        employee_id: emp.data.employee_id,
        address: emp.data.address,
        hire_date: emp.data.hire_date,
        employee_type: emp.data.employee_type,
        weekly_hours_required: emp.data.weekly_hours_required,
        main_branch_id: emp.data.main_branch_id,
        notes: emp.data.notes,
        business_id: businessId,
        is_active: true,
        isValid: emp.isValid,
        validationErrors: emp.errors,
        isDuplicate: emp.isDuplicate,
        name: `${emp.data.first_name} ${emp.data.last_name}`
      }));

      console.log('👥 Preview data generated:', transformedPreview.length);
      setPreviewData(transformedPreview);

    } catch (error) {
      console.error('💥 Error generating preview:', error);
      toast({
        title: 'שגיאה ביצירת תצוגה מקדימה',
        description: error instanceof Error ? error.message : 'שגיאה לא צפויה',
        variant: 'destructive',
      });
    }
  }, [businessId, rawData, branches, existingEmployees, setFieldMappings, setPreviewData, setStep, setShowMappingDialog, toast]);

  return {
    confirmMapping,
  };
};
