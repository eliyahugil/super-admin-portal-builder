import type { FieldMapping, PreviewEmployee, ImportStep } from '../types';

interface UseFieldMappingProps {
  businessId: string | null | undefined;
  rawData: any[];
  branches: Array<{ id: string; name: string }>;
  existingEmployees: Array<{ 
    id: string;
    email?: string; 
    id_number?: string; 
    employee_id?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string;
    employee_type?: string;
    hire_date?: string;
    main_branch_id?: string;
    notes?: string;
    weekly_hours_required?: number;
  }>;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setPreviewData: (data: PreviewEmployee[]) => void;
  setStep: (step: ImportStep) => void;
  setShowMappingDialog: (show: boolean) => void;
  headers: string[];
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
  headers,
}: UseFieldMappingProps) => {
  
  const confirmMapping = async (mappings: FieldMapping[]) => {
    console.log('🔄 useFieldMapping - confirmMapping started with:', {
      mappingsCount: mappings.length,
      businessId,
      rawDataCount: rawData.length,
      activeMappings: mappings.filter(m => m.mappedColumns.length > 0).length,
      headersCount: headers.length,
      sampleHeaders: headers.slice(0, 5),
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
      // Create a mapping from column name to index
      const columnIndexMap: Record<string, number> = {};
      headers.forEach((header, index) => {
        columnIndexMap[header] = index;
      });

      console.log('📋 Column index mapping:', columnIndexMap);

      // Update mappings with correct column indices
      const updatedMappings = mappings.map(mapping => ({
        ...mapping,
        columnIndex: mapping.mappedColumns[0] ? columnIndexMap[mapping.mappedColumns[0]] : undefined
      }));

      console.log('🗺️ Updated mappings with indices:', updatedMappings.map(m => ({
        systemField: m.systemField,
        columnName: m.mappedColumns[0],
        columnIndex: m.columnIndex
      })));

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
          isPartialUpdate: false, // New flag for partial updates
          existingEmployeeId: null, // Store existing employee ID
          validationErrors: [],
          customFields: {}
        };

        // Apply field mappings using the correct column indices
        updatedMappings.forEach(mapping => {
          if (!mapping.mappedColumns || mapping.mappedColumns.length === 0 || mapping.columnIndex === undefined) {
            return;
          }

          let fieldValue = '';
          
          try {
            if (Array.isArray(row) && mapping.columnIndex >= 0 && mapping.columnIndex < row.length) {
              const rawValue = row[mapping.columnIndex];
              fieldValue = rawValue !== null && rawValue !== undefined ? String(rawValue).trim() : '';
              console.log(`✅ Mapped ${mapping.systemField} from column ${mapping.columnIndex} (${mapping.mappedColumns[0]}): "${fieldValue}"`);
            } else {
              console.log(`❌ Cannot access column ${mapping.columnIndex} for ${mapping.systemField}`);
            }
            
            if (fieldValue && fieldValue !== '') {
              if (mapping.isCustomField) {
                employee.customFields[mapping.systemField] = fieldValue;
              } else {
                employee[mapping.systemField] = fieldValue;
              }
            }
          } catch (error) {
            console.error(`💥 Error mapping ${mapping.systemField}:`, error);
          }
        });

        // Set default values
        if (!employee.employee_type) {
          employee.employee_type = 'permanent';
        }

        // Check if this employee already exists in the system
        let existingEmployee = null;
        
        // First try to find by email
        if (employee.email && employee.email.trim() !== '') {
          existingEmployee = existingEmployees.find(emp => 
            emp.email && emp.email.toLowerCase() === employee.email.toLowerCase()
          );
        }
        
        // If not found by email, try by ID number
        if (!existingEmployee && employee.id_number && employee.id_number.trim() !== '') {
          existingEmployee = existingEmployees.find(emp => 
            emp.id_number && emp.id_number === employee.id_number
          );
        }
        
        // If not found by ID number, try by employee_id
        if (!existingEmployee && employee.employee_id && employee.employee_id.trim() !== '') {
          existingEmployee = existingEmployees.find(emp => 
            emp.employee_id && emp.employee_id === employee.employee_id
          );
        }

        const validationErrors = [];
        
        if (existingEmployee) {
          console.log(`🔄 Found existing employee:`, {
            existingId: existingEmployee.id,
            existingEmail: existingEmployee.email,
            newEmail: employee.email
          });

          // Mark as partial update instead of duplicate
          employee.isDuplicate = false;
          employee.isPartialUpdate = true;
          employee.existingEmployeeId = existingEmployee.id;
          
          // Merge with existing data - only update fields that have new values
          const mergedEmployee = { ...employee };
          
          // Keep existing data for fields that are empty in the import
          Object.keys(existingEmployee).forEach(field => {
            if (field !== 'id' && (!mergedEmployee[field] || mergedEmployee[field] === '')) {
              mergedEmployee[field] = existingEmployee[field];
            }
          });
          
          // Update the employee object with merged data
          Object.assign(employee, mergedEmployee);
          
          validationErrors.push(`עדכון חלקי - יתווספו רק נתונים חסרים`);
        } else {
          // New employee - validate required fields
          const hasName = (employee.first_name && employee.first_name.trim()) || 
                         (employee.last_name && employee.last_name.trim());
          const hasEmail = employee.email && employee.email.trim();
          
          if (!hasName && !hasEmail) {
            validationErrors.push('חובה לציין שם פרטי, שם משפחה או אימייל');
          }
        }

        // Email validation (if provided)
        if (employee.email && employee.email.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(employee.email)) {
            validationErrors.push('כתובת מייל לא תקינה');
          }
        }

        // Set validation results
        employee.validationErrors = validationErrors;
        employee.isValid = validationErrors.filter(error => !error.includes('עדכון חלקי')).length === 0;

        const displayName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 
                           employee.email || 'לא הוגדר שם';

        console.log(`✅ Employee ${index + 1} "${displayName}" processed:`, {
          isValid: employee.isValid,
          isDuplicate: employee.isDuplicate,
          isPartialUpdate: employee.isPartialUpdate,
          existingEmployeeId: employee.existingEmployeeId,
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
        partialUpdateEmployees: previewData.filter(emp => emp.isPartialUpdate).length,
        newEmployees: previewData.filter(emp => !emp.isDuplicate && !emp.isPartialUpdate).length,
        errorEmployees: previewData.filter(emp => !emp.isValid).length
      });

      setFieldMappings(updatedMappings);
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
