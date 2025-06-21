
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
      businessId,
      rawDataCount: rawData.length
    });

    if (!businessId) {
      console.error('❌ No business ID available for mapping');
      throw new Error('לא נבחר עסק למיפוי');
    }

    try {
      // Process the raw data with the field mappings
      const previewData: PreviewEmployee[] = rawData.map((row, index) => {
        console.log(`📋 Processing row ${index + 1}:`, row);
        
        const employee: any = {
          business_id: businessId,
          isValid: true,
          isDuplicate: false,
          validationErrors: [],
        };

        // Apply field mappings - תיקון הלוגיקה כאן
        mappings.forEach(mapping => {
          if (mapping.mappedColumns.length > 0) {
            const columnName = mapping.mappedColumns[0]; // שם העמודה מהקובץ
            const fieldValue = row[columnName]; // הערך מהשורה
            
            console.log(`🗺️ Mapping ${mapping.systemField} <- ${columnName} = ${fieldValue}`);
            
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
              if (mapping.isCustomField) {
                // שדות מותאמים אישית
                if (!employee.customFields) {
                  employee.customFields = {};
                }
                employee.customFields[mapping.systemField] = fieldValue;
              } else {
                // שדות מערכת רגילים
                employee[mapping.systemField] = fieldValue;
              }
            }
          }
        });

        // Set default values if not provided
        if (!employee.employee_type) {
          employee.employee_type = 'permanent';
        }

        // Basic validation
        if (!employee.first_name || employee.first_name.trim() === '') {
          employee.isValid = false;
          employee.validationErrors.push('שם פרטי חובה');
        }

        if (!employee.last_name || employee.last_name.trim() === '') {
          employee.isValid = false;
          employee.validationErrors.push('שם משפחה חובה');
        }

        // Email validation
        if (employee.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(employee.email)) {
            employee.validationErrors.push('כתובת מייל לא תקינה');
          }
        }

        // Check for duplicates
        if (employee.email && existingEmployees.some(emp => emp.email === employee.email)) {
          employee.isDuplicate = true;
          employee.validationErrors.push('עובד עם אימייל זה כבר קיים');
        }

        if (employee.id_number && existingEmployees.some(emp => emp.id_number === employee.id_number)) {
          employee.isDuplicate = true;
          employee.validationErrors.push('עובד עם ת.ז זה כבר קיים');
        }

        if (employee.employee_id && existingEmployees.some(emp => emp.employee_id === employee.employee_id)) {
          employee.isDuplicate = true;
          employee.validationErrors.push('עובד עם מספר עובד זה כבר קיים');
        }

        // Branch mapping
        if (employee.main_branch_name) {
          const branch = branches.find(b => 
            b.name.toLowerCase().trim() === employee.main_branch_name.toLowerCase().trim()
          );
          if (branch) {
            employee.main_branch_id = branch.id;
          } else {
            employee.validationErrors.push(`סניף "${employee.main_branch_name}" לא נמצא במערכת`);
          }
          // מוחקים את השדה הזמני
          delete employee.main_branch_name;
        }

        console.log(`✅ Processed employee:`, {
          name: `${employee.first_name} ${employee.last_name}`,
          isValid: employee.isValid,
          isDuplicate: employee.isDuplicate,
          errorsCount: employee.validationErrors?.length || 0,
          employee
        });

        return employee as PreviewEmployee;
      });

      console.log('✅ Field mapping completed:', {
        totalEmployees: previewData.length,
        validEmployees: previewData.filter(emp => emp.isValid).length,
        duplicateEmployees: previewData.filter(emp => emp.isDuplicate).length,
        invalidEmployees: previewData.filter(emp => !emp.isValid).length
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
