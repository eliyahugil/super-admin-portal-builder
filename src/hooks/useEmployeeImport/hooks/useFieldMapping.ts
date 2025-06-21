
import type { FieldMapping, PreviewEmployee, ImportStep } from '../types';

interface UseFieldMappingProps {
  businessId: string | null | undefined;
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
  
  const confirmMapping = async (mappings: FieldMapping[]) => {
    console.log('🔄 useFieldMapping - confirmMapping called:', {
      mappingsCount: mappings.length,
      businessId
    });

    if (!businessId) {
      console.error('❌ No business ID available for mapping');
      throw new Error('לא נבחר עסק למיפוי');
    }

    try {
      // Process the raw data with the field mappings
      const previewData: PreviewEmployee[] = rawData.map((row, index) => {
        const employee: any = {
          business_id: businessId,
          isValid: true,
          isDuplicate: false,
          validationErrors: [],
        };

        // Apply field mappings
        mappings.forEach(mapping => {
          if (mapping.mappedColumns.length > 0) {
            const columnIndex = rawData[0]?.indexOf(mapping.mappedColumns[0]);
            if (columnIndex !== -1) {
              employee[mapping.systemField] = row[columnIndex];
            }
          }
        });

        // Set default employee type if not provided
        if (!employee.employee_type) {
          employee.employee_type = 'permanent';
        }

        // Basic validation
        if (!employee.first_name) {
          employee.isValid = false;
          employee.validationErrors.push('שם פרטי חובה');
        }

        if (!employee.last_name) {
          employee.isValid = false;
          employee.validationErrors.push('שם משפחה חובה');
        }

        // Check for duplicates
        if (employee.email && existingEmployees.some(emp => emp.email === employee.email)) {
          employee.isDuplicate = true;
          employee.validationErrors.push('עובד עם אימייל זה כבר קיים');
        }

        return employee as PreviewEmployee;
      });

      console.log('✅ Field mapping completed:', {
        totalEmployees: previewData.length,
        validEmployees: previewData.filter(emp => emp.isValid).length
      });

      setFieldMappings(mappings);
      setPreviewData(previewData);
      setShowMappingDialog(false);
      setStep('preview');
    } catch (error) {
      console.error('❌ Error in field mapping:', error);
      throw error;
    }
  };

  return {
    confirmMapping,
  };
};
