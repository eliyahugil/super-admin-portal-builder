
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
      rawDataCount: rawData.length,
      mappings: mappings.map(m => ({ 
        systemField: m.systemField, 
        mappedColumns: m.mappedColumns,
        isCustomField: m.isCustomField
      }))
    });

    if (!businessId) {
      console.error('❌ No business ID available for mapping');
      throw new Error('לא נבחר עסק למיפוי');
    }

    try {
      // Process the raw data with the field mappings
      const previewData: PreviewEmployee[] = rawData.map((row, index) => {
        console.log(`📋 Processing row ${index + 1}:`, {
          rowData: Array.isArray(row) ? `Array with ${row.length} items` : Object.keys(row),
          firstFewValues: Array.isArray(row) ? row.slice(0, 5) : row
        });
        
        const employee: any = {
          business_id: businessId,
          isValid: true,
          isDuplicate: false,
          validationErrors: [],
        };

        // Apply field mappings
        mappings.forEach(mapping => {
          if (mapping.mappedColumns && mapping.mappedColumns.length > 0) {
            const columnName = mapping.mappedColumns[0]; // שם העמודה מהקובץ
            
            // בדיקה אם זה אינדקס מספרי או שם עמודה
            let fieldValue;
            if (Array.isArray(row)) {
              // אם הנתונים הם מערך, נשתמש באינדקס
              const columnIndex = parseInt(columnName);
              if (!isNaN(columnIndex)) {
                fieldValue = row[columnIndex];
              } else {
                // אם זה לא מספר, ננסה למצוא את העמודה לפי שם
                fieldValue = row[columnName];
              }
            } else {
              // אם הנתונים הם אובייקט, נשתמש בשם העמודה
              fieldValue = row[columnName];
            }
            
            console.log(`🗺️ Mapping ${mapping.systemField} <- column "${columnName}" = "${fieldValue}"`);
            
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
              const cleanValue = String(fieldValue).toString().trim();
              
              if (mapping.isCustomField) {
                // שדות מותאמים אישית
                if (!employee.customFields) {
                  employee.customFields = {};
                }
                employee.customFields[mapping.systemField] = cleanValue;
              } else {
                // שדות מערכת רגילים
                employee[mapping.systemField] = cleanValue;
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
          name: `${employee.first_name || 'לא הוגדר'} ${employee.last_name || 'לא הוגדר'}`,
          isValid: employee.isValid,
          isDuplicate: employee.isDuplicate,
          errorsCount: employee.validationErrors?.length || 0,
          fields: Object.keys(employee).filter(k => !['business_id', 'isValid', 'isDuplicate', 'validationErrors'].includes(k))
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
