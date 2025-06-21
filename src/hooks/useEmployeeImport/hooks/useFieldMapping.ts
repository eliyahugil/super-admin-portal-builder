
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
    console.log('🔄 useFieldMapping - confirmMapping started with:', {
      mappingsCount: mappings.length,
      businessId,
      rawDataCount: rawData.length,
      activeMappings: mappings.filter(m => m.mappedColumns.length > 0).length
    });

    if (!businessId) {
      console.error('❌ No business ID available for mapping');
      throw new Error('לא נבחר עסק למיפוי');
    }

    if (!mappings.length) {
      console.error('❌ No mappings provided');
      throw new Error('לא הוגדרו מיפויי שדות');
    }

    try {
      // Process the raw data based on mappings
      console.log('📊 Processing raw data with mappings');
      
      const previewData: PreviewEmployee[] = rawData.map((row, index) => {
        console.log(`📋 Processing row ${index + 1}:`, {
          rowType: typeof row,
          isArray: Array.isArray(row),
          sampleData: Array.isArray(row) ? row.slice(0, 3) : Object.entries(row || {}).slice(0, 3)
        });
        
        const employee: any = {
          business_id: businessId,
          isValid: true,
          isDuplicate: false,
          validationErrors: [],
          customFields: {}
        };

        // Apply field mappings
        mappings.forEach(mapping => {
          if (!mapping.mappedColumns || mapping.mappedColumns.length === 0) {
            return;
          }

          const fieldValues: string[] = [];
          
          mapping.mappedColumns.forEach(columnName => {
            let fieldValue = '';
            
            try {
              if (Array.isArray(row)) {
                // Extract column index from name (e.g., "Column 1" -> index 0)
                const indexMatch = columnName.match(/(\d+)/);
                if (indexMatch) {
                  const columnIndex = parseInt(indexMatch[1]) - 1;
                  if (columnIndex >= 0 && columnIndex < row.length) {
                    fieldValue = String(row[columnIndex] || '').trim();
                    console.log(`  ✅ Array[${columnIndex}] = "${fieldValue}"`);
                  }
                }
              } else if (row && typeof row === 'object') {
                // Direct property access for objects
                fieldValue = String(row[columnName] || '').trim();
                console.log(`  ✅ Object["${columnName}"] = "${fieldValue}"`);
              }
              
              if (fieldValue) {
                fieldValues.push(fieldValue);
              }
            } catch (error) {
              console.error(`  💥 Error accessing ${columnName}:`, error);
            }
          });
          
          if (fieldValues.length > 0) {
            const combinedValue = fieldValues.join(' ').trim();
            
            if (mapping.isCustomField) {
              employee.customFields[mapping.systemField] = combinedValue;
            } else {
              employee[mapping.systemField] = combinedValue;
            }
            
            console.log(`✅ Mapped ${mapping.systemField} = "${combinedValue}"`);
          }
        });

        // Set default values
        if (!employee.employee_type) {
          employee.employee_type = 'permanent';
        }

        // Basic validation
        const validationErrors = [];
        
        // Check for required fields
        if (!employee.first_name && !employee.last_name) {
          validationErrors.push('חובה לציין שם פרטי או שם משפחה');
        }

        // Email validation
        if (employee.email && employee.email.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(employee.email)) {
            validationErrors.push('כתובת מייל לא תקינה');
          }
          
          // Check for duplicates
          if (existingEmployees.some(emp => emp.email === employee.email)) {
            employee.isDuplicate = true;
            validationErrors.push('עובד עם אימייל זה כבר קיים');
          }
        }

        // ID number validation
        if (employee.id_number && employee.id_number.trim() !== '' && 
            existingEmployees.some(emp => emp.id_number === employee.id_number)) {
          employee.isDuplicate = true;
          validationErrors.push('עובד עם ת.ז זה כבר קיים');
        }

        // Set validation results
        employee.validationErrors = validationErrors;
        employee.isValid = validationErrors.length === 0;

        console.log(`✅ Employee ${index + 1} processed:`, {
          name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
          isValid: employee.isValid,
          isDuplicate: employee.isDuplicate,
          errorsCount: employee.validationErrors?.length || 0
        });

        return employee as PreviewEmployee;
      });

      console.log('📊 Field mapping completed:', {
        totalEmployees: previewData.length,
        validEmployees: previewData.filter(emp => emp.isValid).length,
        duplicateEmployees: previewData.filter(emp => emp.isDuplicate).length,
        errorEmployees: previewData.filter(emp => !emp.isValid).length
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
