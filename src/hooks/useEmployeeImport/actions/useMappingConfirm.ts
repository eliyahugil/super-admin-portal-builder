
import { useToast } from '@/hooks/use-toast';
import { ExcelImportService } from '@/services/ExcelImportService';
import type { ImportStep, ImportValidation } from '../types';
import type { ExcelRow, PreviewEmployee } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';
import { employeeTypes } from '../constants';
import { useAuthUtils } from '../utils/authUtils';

interface UseMappingConfirmProps {
  businessId: string | null;
  rawData: ExcelRow[];
  branches: any[];
  existingEmployees: any[];
  validation: ImportValidation;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setShowMappingDialog: (show: boolean) => void;
  setPreviewData: (data: PreviewEmployee[]) => void;
  setStep: (step: ImportStep) => void;
}

export const useMappingConfirm = ({
  businessId,
  rawData,
  branches,
  existingEmployees,
  validation,
  setFieldMappings,
  setShowMappingDialog,
  setPreviewData,
  setStep,
}: UseMappingConfirmProps) => {
  const { toast } = useToast();
  const { checkAuthSession } = useAuthUtils();

  const handleMappingConfirm = async (mappings: FieldMapping[]) => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'זיהוי עסק לא תקין',
        variant: 'destructive'
      });
      return;
    }

    // Check authentication before proceeding with mapping
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return;
    }
    
    console.log('✅ Mapping confirmed, generating preview...');
    setFieldMappings(mappings);
    setShowMappingDialog(false);
    
    // Generate preview with enhanced validation
    const preview = ExcelImportService.generatePreview(
      rawData,
      mappings,
      businessId,
      branches,
      existingEmployees,
      employeeTypes
    );
    
    console.log('📊 Preview generated:', {
      total: preview.length,
      valid: preview.filter(p => p.isValid).length,
      duplicates: preview.filter(p => p.isDuplicate).length
    });
    
    setPreviewData(preview);
    
    // Trigger advanced validation
    setTimeout(() => {
      validation.validateImportData();
    }, 100);
    
    setStep('preview');
  };

  return { handleMappingConfirm };
};
