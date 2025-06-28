
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
  
  const findExistingEmployee = (importedEmployee: any) => {
    // Priority order for matching: email > id_number > employee_id > name combination
    let existingEmployee = null;
    
    // 1. Try to match by email (most reliable)
    if (importedEmployee.email && importedEmployee.email.trim() !== '') {
      existingEmployee = existingEmployees.find(emp => 
        emp.email && emp.email.toLowerCase().trim() === importedEmployee.email.toLowerCase().trim()
      );
      if (existingEmployee) {
        console.log(`🔍 Found existing employee by email: ${existingEmployee.email}`);
        return existingEmployee;
      }
    }
    
    // 2. Try to match by ID number
    if (importedEmployee.id_number && importedEmployee.id_number.trim() !== '') {
      existingEmployee = existingEmployees.find(emp => 
        emp.id_number && emp.id_number.trim() === importedEmployee.id_number.trim()
      );
      if (existingEmployee) {
        console.log(`🔍 Found existing employee by ID number: ${existingEmployee.id_number}`);
        return existingEmployee;
      }
    }
    
    // 3. Try to match by employee_id
    if (importedEmployee.employee_id && importedEmployee.employee_id.trim() !== '') {
      existingEmployee = existingEmployees.find(emp => 
        emp.employee_id && emp.employee_id.trim() === importedEmployee.employee_id.trim()
      );
      if (existingEmployee) {
        console.log(`🔍 Found existing employee by employee ID: ${existingEmployee.employee_id}`);
        return existingEmployee;
      }
    }
    
    // 4. Try to match by full name combination (less reliable)
    if (importedEmployee.first_name && importedEmployee.last_name) {
      const importedFullName = `${importedEmployee.first_name} ${importedEmployee.last_name}`.toLowerCase().trim();
      existingEmployee = existingEmployees.find(emp => {
        if (emp.first_name && emp.last_name) {
          const existingFullName = `${emp.first_name} ${emp.last_name}`.toLowerCase().trim();
          return existingFullName === importedFullName;
        }
        return false;
      });
      if (existingEmployee) {
        console.log(`🔍 Found existing employee by name: ${existingEmployee.first_name} ${existingEmployee.last_name}`);
        return existingEmployee;
      }
    }
    
    return null;
  };

  const confirmMapping = async (mappings: FieldMapping[]): Promise<void> => {
    console.log('🔄 useFieldMapping - confirmMapping started with:', {
      mappingsCount: mappings.length,
      businessId,
      rawDataCount: rawData.length,
      activeMappings: mappings.filter(m => m.mappedColumns.length > 0).length,
      headersCount: headers.length,
      existingEmployeesCount: existingEmployees.length
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
          rowLength: Array.isArray(row) ? row.length : Object.keys(row || {}).length
        });
        
        const employee: any = {
          business_id: businessId,
          isValid: true,
          isDuplicate: false,
          isPartialUpdate: false,
          existingEmployeeId: null,
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
        const existingEmployee = findExistingEmployee(employee);
        const validationErrors = [];
        
        if (existingEmployee) {
          console.log(`🔄 Found existing employee for row ${index + 1}:`, {
            existingId: existingEmployee.id,
            existingEmail: existingEmployee.email,
            existingName: `${existingEmployee.first_name} ${existingEmployee.last_name}`,
            importedEmail: employee.email,
            importedName: `${employee.first_name} ${employee.last_name}`
          });

          // Mark as partial update instead of duplicate
          employee.isDuplicate = false;
          employee.isPartialUpdate = true;
          employee.existingEmployeeId = existingEmployee.id;
          
          // Count how many fields will be updated (only empty fields in existing employee)
          let fieldsToUpdate = 0;
          const updateableFields = [
            'first_name', 'last_name', 'email', 'phone', 'id_number', 
            'employee_id', 'address', 'hire_date', 'employee_type', 
            'weekly_hours_required', 'main_branch_id', 'notes'
          ];
          
          updateableFields.forEach(field => {
            const importValue = employee[field];
            const existingValue = existingEmployee[field];
            
            // Count field if existing is empty and import has value
            if ((!existingValue || existingValue === '' || existingValue === null) && 
                importValue !== undefined && importValue !== null && importValue !== '') {
              fieldsToUpdate++;
            }
          });
          
          if (fieldsToUpdate > 0) {
            validationErrors.push(`עדכון חלקי - יתווספו ${fieldsToUpdate} שדות חסרים`);
          } else {
            validationErrors.push(`עובד קיים - אין שדות חסרים לעדכון`);
            employee.isValid = false; // Don't process if no updates needed
          }
          
          // Keep the existing employee's current data for display
          Object.keys(existingEmployee).forEach(field => {
            if (field !== 'id' && (!employee[field] || employee[field] === '')) {
              employee[field] = existingEmployee[field];
            }
          });
          
        } else {
          // New employee - validate required fields
          const hasName = (employee.first_name && employee.first_name.trim()) || 
                         (employee.last_name && employee.last_name.trim());
          const hasEmail = employee.email && employee.email.trim();
          
          if (!hasName && !hasEmail) {
            validationErrors.push('חובה לציין שם פרטי, שם משפחה או אימייל');
            employee.isValid = false;
          }
        }

        // Email validation (if provided)
        if (employee.email && employee.email.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(employee.email)) {
            validationErrors.push('כתובת מייל לא תקינה');
            employee.isValid = false;
          }
        }

        // Set validation results
        employee.validationErrors = validationErrors;
        
        // If we had validation errors that made it invalid, keep that status
        if (validationErrors.some(error => !error.includes('עדכון חלקי') && !error.includes('אין שדות חסרים'))) {
          employee.isValid = false;
        }

        const displayName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 
                           employee.email || 'לא הוגדר שם';

        console.log(`✅ Employee ${index + 1} "${displayName}" processed:`, {
          isValid: employee.isValid,
          isDuplicate: employee.isDuplicate,
          isPartialUpdate: employee.isPartialUpdate,
          existingEmployeeId: employee.existingEmployeeId,
          errorsCount: employee.validationErrors?.length || 0,
          errors: employee.validationErrors
        });

        return employee as PreviewEmployee;
      });

      // Filter out duplicates that were marked as invalid
      const finalPreviewData = previewData.filter(emp => {
        if (emp.isDuplicate && !emp.isPartialUpdate) {
          console.log(`🚫 Filtering out duplicate employee: ${emp.first_name} ${emp.last_name}`);
          return false;
        }
        return true;
      });

      console.log('📊 Field mapping completed:', {
        totalRows: rawData.length,
        processedEmployees: finalPreviewData.length,
        validEmployees: finalPreviewData.filter(emp => emp.isValid).length,
        newEmployees: finalPreviewData.filter(emp => !emp.isPartialUpdate && emp.isValid).length,
        partialUpdateEmployees: finalPreviewData.filter(emp => emp.isPartialUpdate && emp.isValid).length,
        errorEmployees: finalPreviewData.filter(emp => !emp.isValid).length
      });

      setFieldMappings(updatedMappings);
      setPreviewData(finalPreviewData);
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
