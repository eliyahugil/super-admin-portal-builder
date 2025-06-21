
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
    console.log('🔄 useFieldMapping - confirmMapping called (direct import flow):', {
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
          rowType: Array.isArray(row) ? 'array' : typeof row,
          rowLength: Array.isArray(row) ? row.length : Object.keys(row).length,
          sampleData: Array.isArray(row) ? row.slice(0, 3) : Object.entries(row).slice(0, 3)
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
              // For array-based data, find the column by index
              const columnIndex = parseInt(columnName.replace('Column ', '')) - 1;
              if (columnIndex >= 0 && columnIndex < row.length) {
                fieldValue = row[columnIndex];
              } else {
                // Try to find by exact column name match
                fieldValue = row[columnName];
              }
            } else if (typeof row === 'object' && row !== null) {
              // For object-based data
              fieldValue = row[columnName];
            }
            
            console.log(`🗺️ Mapping ${mapping.systemField} <- column "${columnName}" (index: ${Array.isArray(row) ? parseInt(columnName.replace('Column ', '')) - 1 : 'N/A'}) = "${fieldValue}"`);
            
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
        if (!employee.first_name || employee.first_name.trim() === '') {
          validationErrors.push('שם פרטי חובה');
        }

        if (!employee.last_name || employee.last_name.trim() === '') {
          validationErrors.push('שם משפחה חובה');
        }

        // Email validation
        if (employee.email) {
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

        // Check for duplicate ID number
        if (employee.id_number && existingEmployees.some(emp => emp.id_number === employee.id_number)) {
          employee.isDuplicate = true;
          validationErrors.push('עובד עם ת.ז זה כבר קיים');
        }

        // Check for duplicate employee ID
        if (employee.employee_id && existingEmployees.some(emp => emp.employee_id === employee.employee_id)) {
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

        // Set validation results
        employee.validationErrors = validationErrors;
        employee.isValid = validationErrors.length === 0;
        
        // Mark as invalid if has validation errors and not duplicate
        if (validationErrors.length > 0 && !employee.isDuplicate) {
          employee.isValid = false;
        }

        console.log(`✅ Processed employee:`, {
          name: `${employee.first_name || 'לא הוגדר'} ${employee.last_name || 'לא הוגדר'}`,
          isValid: employee.isValid,
          isDuplicate: employee.isDuplicate,
          errorsCount: employee.validationErrors?.length || 0,
          errors: employee.validationErrors,
          hasRequiredFields: !!(employee.first_name && employee.last_name)
        });

        return employee as PreviewEmployee;
      });

      console.log('✅ Field mapping completed (direct import):', {
        totalEmployees: previewData.length,
        validEmployees: previewData.filter(emp => emp.isValid).length,
        duplicateEmployees: previewData.filter(emp => emp.isDuplicate).length,
        invalidEmployees: previewData.filter(emp => !emp.isValid).length,
        sampleValidEmployee: previewData.find(emp => emp.isValid)
      });

      // Store the mappings and preview data but skip the preview step
      setFieldMappings(mappings);
      setPreviewData(previewData);
      setShowMappingDialog(false);
      
      // Skip preview step - data is ready for import
      console.log('🚀 Skipping preview step, data ready for import');
      
    } catch (error) {
      console.error('❌ Error in field mapping:', error);
      throw error;
    }
  };

  return {
    confirmMapping,
  };
};
