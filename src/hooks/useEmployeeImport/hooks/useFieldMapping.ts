
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
      sampleRawData: rawData.slice(0, 2),
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
          rowType: Array.isArray(row) ? 'array' : typeof row,
          rowLength: Array.isArray(row) ? row.length : Object.keys(row || {}).length,
          sampleData: Array.isArray(row) ? row.slice(0, 5) : Object.entries(row || {}).slice(0, 5),
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
            const columnName = mapping.mappedColumns[0];
            
            let fieldValue;
            if (Array.isArray(row)) {
              // For array-based data, extract column index from column name
              const columnMatch = columnName.match(/^(?:Column\s*|Col\s*|C)?(\d+)$/i);
              if (columnMatch) {
                const columnIndex = parseInt(columnMatch[1]) - 1; // Convert to 0-based index
                if (columnIndex >= 0 && columnIndex < row.length) {
                  fieldValue = row[columnIndex];
                }
              } else {
                // Try to find by exact column name match
                const headerRow = rawData[0];
                if (Array.isArray(headerRow)) {
                  const headerIndex = headerRow.findIndex(header => 
                    header && header.toString().trim().toLowerCase() === columnName.toLowerCase()
                  );
                  if (headerIndex >= 0 && headerIndex < row.length) {
                    fieldValue = row[headerIndex];
                  }
                }
              }
            } else if (typeof row === 'object' && row !== null) {
              // For object-based data
              fieldValue = row[columnName];
            }
            
            console.log(`🗺️ Mapping ${mapping.systemField} <- column "${columnName}" = "${fieldValue}"`);
            
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
              const cleanValue = String(fieldValue).trim();
              
              if (mapping.isCustomField) {
                if (!employee.customFields) {
                  employee.customFields = {};
                }
                employee.customFields[mapping.systemField] = cleanValue;
              } else {
                // Handle special field mappings
                if (mapping.systemField === 'main_branch_id') {
                  // Store branch name temporarily for lookup
                  employee.main_branch_name = cleanValue;
                } else {
                  employee[mapping.systemField] = cleanValue;
                }
              }
            }
          }
        });

        // Set default values if not provided
        if (!employee.employee_type) {
          employee.employee_type = 'permanent';
        }

        // Basic validation
        const validationErrors = [];
        
        // Check if we have at least basic name data
        if (!employee.first_name && !employee.last_name) {
          validationErrors.push('חובה לציין לפחות שם פרטי או שם משפחה');
        }

        // Email validation - רק אם יש אימייל
        if (employee.email && employee.email.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(employee.email)) {
            validationErrors.push('כתובת מייל לא תקינה');
          }
          
          // Check for duplicate email
          if (existingEmployees.some(emp => emp.email === employee.email)) {
            employee.isDuplicate = true;
            validationErrors.push('עובד עם אימייל זה כבר קיים');
          }
        }

        // Check for duplicate ID number - רק אם יש ת.ז
        if (employee.id_number && employee.id_number.trim() !== '' && 
            existingEmployees.some(emp => emp.id_number === employee.id_number)) {
          employee.isDuplicate = true;
          validationErrors.push('עובד עם ת.ז זה כבר קיים');
        }

        // Check for duplicate employee ID - רק אם יש מספר עובד
        if (employee.employee_id && employee.employee_id.trim() !== '' && 
            existingEmployees.some(emp => emp.employee_id === employee.employee_id)) {
          employee.isDuplicate = true;
          validationErrors.push('עובד עם מספר עובד זה כבר קיים');
        }

        // Branch mapping
        if (employee.main_branch_name) {
          const branch = branches.find(b => 
            b.name.toLowerCase().trim() === employee.main_branch_name.toLowerCase().trim()
          );
          if (branch) {
            employee.main_branch_id = branch.id;
          } else {
            validationErrors.push(`סניף "${employee.main_branch_name}" לא נמצא במערכת`);
          }
          delete employee.main_branch_name;
        }

        // Check if we have any meaningful data
        const hasAnyData = Object.keys(employee).some(key => 
          key !== 'business_id' && 
          key !== 'isValid' && 
          key !== 'isDuplicate' && 
          key !== 'validationErrors' &&
          key !== 'employee_type' &&
          employee[key] !== undefined && 
          employee[key] !== null && 
          String(employee[key]).trim() !== ''
        );

        // Set validation results
        employee.validationErrors = validationErrors;
        employee.isValid = hasAnyData && validationErrors.length === 0;

        console.log(`✅ Processed employee ${index + 1}:`, {
          hasAnyData,
          isValid: employee.isValid,
          isDuplicate: employee.isDuplicate,
          errorsCount: employee.validationErrors?.length || 0,
          errors: employee.validationErrors,
          basicData: {
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            phone: employee.phone
          }
        });

        return employee as PreviewEmployee;
      });

      console.log('✅ Field mapping completed:', {
        totalEmployees: previewData.length,
        validEmployees: previewData.filter(emp => emp.isValid).length,
        duplicateEmployees: previewData.filter(emp => emp.isDuplicate).length,
        invalidEmployees: previewData.filter(emp => !emp.isValid).length,
      });

      // Store the mappings and preview data
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
