
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
      // Skip the first row if it looks like headers
      let dataRows = rawData;
      let hasHeaders = false;
      
      if (rawData.length > 1) {
        const firstRow = rawData[0];
        const secondRow = rawData[1];
        
        // Check if first row contains header-like strings
        if (Array.isArray(firstRow) && Array.isArray(secondRow)) {
          const firstRowIsHeaders = firstRow.some(cell => 
            typeof cell === 'string' && 
            (cell.includes('שם') || cell.includes('name') || cell.includes('אימייל') || cell.includes('email'))
          );
          
          if (firstRowIsHeaders) {
            console.log('📋 Detected header row, skipping first row');
            dataRows = rawData.slice(1);
            hasHeaders = true;
          }
        }
      }

      console.log('📊 Processing data rows:', {
        totalRows: dataRows.length,
        hasHeaders,
        sampleRow: dataRows[0] ? {
          isArray: Array.isArray(dataRows[0]),
          sample: Array.isArray(dataRows[0]) ? dataRows[0].slice(0, 3) : Object.entries(dataRows[0] || {}).slice(0, 3)
        } : 'No data'
      });

      const previewData: PreviewEmployee[] = dataRows.map((row, index) => {
        console.log(`📋 Processing row ${index + 1}:`, {
          rowData: Array.isArray(row) ? row.slice(0, 3) : Object.entries(row || {}).slice(0, 3)
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
            const fieldValues: string[] = [];
            
            mapping.mappedColumns.forEach(columnName => {
              let fieldValue;
              
              if (Array.isArray(row)) {
                // Convert column name to array index
                // Handle patterns like "Column 1", "Col 1", "C1", or just "1"
                let columnIndex = -1;
                
                // Try to extract number from column name
                const numberMatch = columnName.match(/(\d+)/);
                if (numberMatch) {
                  columnIndex = parseInt(numberMatch[1]) - 1; // Convert to 0-based index
                }
                
                if (columnIndex >= 0 && columnIndex < row.length) {
                  fieldValue = row[columnIndex];
                  console.log(`  Array mapping: "${columnName}" -> index ${columnIndex} -> "${fieldValue}"`);
                } else {
                  console.log(`  Array mapping failed: "${columnName}" -> index ${columnIndex} (invalid)`);
                }
              } else if (typeof row === 'object' && row !== null) {
                // For object data, try direct property access
                fieldValue = row[columnName];
                console.log(`  Object mapping: "${columnName}" -> "${fieldValue}"`);
              }
              
              if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                const cleanValue = String(fieldValue).trim();
                if (cleanValue) {
                  fieldValues.push(cleanValue);
                }
              }
            });
            
            console.log(`🗺️ Mapping result: ${mapping.systemField} <- [${mapping.mappedColumns.join(', ')}] = "${fieldValues.join(' + ')}"`);
            
            if (fieldValues.length > 0) {
              const combinedValue = fieldValues.length === 1 ? fieldValues[0] : fieldValues.join(' ');
              
              if (mapping.isCustomField) {
                if (!employee.customFields) {
                  employee.customFields = {};
                }
                employee.customFields[mapping.systemField] = combinedValue;
              } else {
                // Handle special field mappings
                if (mapping.systemField === 'main_branch_id') {
                  employee.main_branch_name = combinedValue;
                } else {
                  employee[mapping.systemField] = combinedValue;
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
        
        const hasName = employee.first_name || employee.last_name;
        const hasContact = employee.email || employee.phone;
        const hasIdentifier = employee.id_number || employee.employee_id;
        
        if (!hasName && !hasContact && !hasIdentifier) {
          validationErrors.push('חובה לציין לפחות שם, פרט קשר או מזהה');
        }

        // Email validation
        if (employee.email && employee.email.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(employee.email)) {
            validationErrors.push('כתובת מייל לא תקינה');
          }
          
          if (existingEmployees.some(emp => emp.email === employee.email)) {
            employee.isDuplicate = true;
            validationErrors.push('עובד עם אימייל זה כבר קיים');
          }
        }

        // Check for duplicate ID number
        if (employee.id_number && employee.id_number.trim() !== '' && 
            existingEmployees.some(emp => emp.id_number === employee.id_number)) {
          employee.isDuplicate = true;
          validationErrors.push('עובד עם ת.ז זה כבר קיים');
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
        employee.isValid = validationErrors.length === 0 && (hasName || hasContact || hasIdentifier);

        console.log(`✅ Processed employee ${index + 1}:`, {
          isValid: employee.isValid,
          hasData: !!(employee.first_name || employee.last_name || employee.email),
          errorsCount: employee.validationErrors?.length || 0
        });

        return employee as PreviewEmployee;
      });

      console.log('✅ Field mapping completed:', {
        totalEmployees: previewData.length,
        validEmployees: previewData.filter(emp => emp.isValid).length,
        withData: previewData.filter(emp => emp.first_name || emp.last_name || emp.email).length
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
