
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
      activeMappings: mappings.filter(m => m.mappedColumns.length > 0).length,
      sampleRawData: rawData.slice(0, 2)
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
          rowLength: Array.isArray(row) ? row.length : Object.keys(row || {}).length,
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
                // Extract column index from name
                let columnIndex = -1;
                
                // Handle "Column X" format
                const columnMatch = columnName.match(/Column (\d+)/);
                if (columnMatch) {
                  columnIndex = parseInt(columnMatch[1]) - 1; // Convert to 0-based
                } else {
                  // If it's not "Column X" format, try to find by exact header match
                  // This would need header mapping, for now use fallback
                  console.log(`  ⚠️ Non-standard column format: ${columnName}, using fallback`);
                  columnIndex = 0; // Fallback
                }
                
                if (columnIndex >= 0 && columnIndex < row.length) {
                  const rawValue = row[columnIndex];
                  fieldValue = rawValue !== null && rawValue !== undefined ? String(rawValue).trim() : '';
                  console.log(`  ✅ Array[${columnIndex}] "${columnName}" = "${fieldValue}"`);
                } else {
                  console.log(`  ❌ Column index ${columnIndex} out of bounds for "${columnName}" (array length: ${row.length})`);
                }
              } else if (row && typeof row === 'object') {
                // Direct property access for objects
                fieldValue = String(row[columnName] || '').trim();
                console.log(`  ✅ Object["${columnName}"] = "${fieldValue}"`);
              }
              
              if (fieldValue && fieldValue !== '') {
                fieldValues.push(fieldValue);
              }
            } catch (error) {
              console.error(`  💥 Error accessing ${columnName}:`, error);
            }
          });
          
          if (fieldValues.length > 0) {
            const combinedValue = fieldValues.length > 1 ? fieldValues.join(' ').trim() : fieldValues[0];
            
            if (mapping.isCustomField) {
              employee.customFields[mapping.systemField] = combinedValue;
            } else {
              employee[mapping.systemField] = combinedValue;
            }
            
            console.log(`✅ Final mapping: ${mapping.systemField} = "${combinedValue}" (from ${fieldValues.length} columns)`);
          }
        });

        // Set default values
        if (!employee.employee_type) {
          employee.employee_type = 'permanent';
        }

        // Basic validation
        const validationErrors = [];
        
        // Check for required fields - at least first name OR last name OR email
        const hasName = (employee.first_name && employee.first_name.trim()) || 
                       (employee.last_name && employee.last_name.trim());
        const hasEmail = employee.email && employee.email.trim();
        
        if (!hasName && !hasEmail) {
          validationErrors.push('חובה לציין שם פרטי, שם משפחה או אימייל');
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

        const displayName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 
                           employee.email || 'לא הוגדר שם';

        console.log(`✅ Employee ${index + 1} "${displayName}" processed:`, {
          isValid: employee.isValid,
          isDuplicate: employee.isDuplicate,
          errorsCount: employee.validationErrors?.length || 0,
          errors: employee.validationErrors,
          firstName: employee.first_name,
          lastName: employee.last_name,
          email: employee.email
        });

        return employee as PreviewEmployee;
      });

      console.log('📊 Field mapping completed:', {
        totalEmployees: previewData.length,
        validEmployees: previewData.filter(emp => emp.isValid).length,
        duplicateEmployees: previewData.filter(emp => emp.isDuplicate).length,
        errorEmployees: previewData.filter(emp => !emp.isValid).length,
        sampleValidEmployee: previewData.find(emp => emp.isValid) ? {
          name: `${previewData.find(emp => emp.isValid)?.first_name} ${previewData.find(emp => emp.isValid)?.last_name}`,
          email: previewData.find(emp => emp.isValid)?.email
        } : 'none'
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
