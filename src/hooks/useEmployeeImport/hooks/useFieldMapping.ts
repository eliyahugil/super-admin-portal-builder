
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
    // Enhanced duplicate detection with better matching and priority scoring
    let existingEmployee = null;
    let matchScore = 0;
    let matchReason = '';
    
    console.log('🔍 Searching for existing employee:', {
      email: importedEmployee.email,
      phone: importedEmployee.phone,
      id_number: importedEmployee.id_number,
      employee_id: importedEmployee.employee_id,
      name: `${importedEmployee.first_name || ''} ${importedEmployee.last_name || ''}`.trim()
    });
    
    // Track all potential matches for better reporting
    const potentialMatches: { employee: any; score: number; reason: string }[] = [];
    
    existingEmployees.forEach(emp => {
      let currentScore = 0;
      const matchReasons: string[] = [];
      
      // 1. Email matching (highest priority - score 100)
      if (importedEmployee.email && importedEmployee.email.trim() !== '' && 
          emp.email && emp.email.toLowerCase().trim() === importedEmployee.email.toLowerCase().trim()) {
        currentScore += 100;
        matchReasons.push('אימייל זהה');
      }
      
      // 2. ID number matching (very high priority - score 95)
      if (importedEmployee.id_number && importedEmployee.id_number.trim() !== '' &&
          emp.id_number && emp.id_number.trim() === importedEmployee.id_number.trim()) {
        currentScore += 95;
        matchReasons.push('תעודת זהות זהה');
      }
      
      // 3. Employee ID matching (high priority - score 90)
      if (importedEmployee.employee_id && importedEmployee.employee_id.trim() !== '' &&
          emp.employee_id && emp.employee_id.trim() === importedEmployee.employee_id.trim()) {
        currentScore += 90;
        matchReasons.push('מספר עובד זהה');
      }
      
      // 4. Phone matching (medium-high priority - score 80)
      if (importedEmployee.phone && importedEmployee.phone.trim() !== '' && emp.phone) {
        const importedPhone = importedEmployee.phone.trim().replace(/\D/g, '');
        const existingPhone = emp.phone.trim().replace(/\D/g, '');
        if (importedPhone.length >= 9 && existingPhone === importedPhone) {
          currentScore += 80;
          matchReasons.push('מספר טלפון זהה');
        }
      }
      
      // 5. Full name matching (medium priority - score 70)
      if (importedEmployee.first_name && importedEmployee.last_name && 
          emp.first_name && emp.last_name) {
        const importedFullName = `${importedEmployee.first_name} ${importedEmployee.last_name}`.toLowerCase().trim();
        const existingFullName = `${emp.first_name} ${emp.last_name}`.toLowerCase().trim();
        if (importedFullName === existingFullName) {
          currentScore += 70;
          matchReasons.push('שם מלא זהה');
        }
      }
      
      // 6. Similar names (lower priority - score 40)
      if (importedEmployee.first_name && importedEmployee.last_name && 
          emp.first_name && emp.last_name && currentScore === 0) {
        const firstNameSimilar = 
          importedEmployee.first_name.toLowerCase().includes(emp.first_name.toLowerCase()) ||
          emp.first_name.toLowerCase().includes(importedEmployee.first_name.toLowerCase());
        const lastNameSimilar = 
          importedEmployee.last_name.toLowerCase().includes(emp.last_name.toLowerCase()) ||
          emp.last_name.toLowerCase().includes(importedEmployee.last_name.toLowerCase());
        
        if (firstNameSimilar && lastNameSimilar) {
          currentScore += 40;
          matchReasons.push('שמות דומים');
        }
      }
      
      // Store potential match if score is significant
      if (currentScore >= 40) {
        potentialMatches.push({
          employee: emp,
          score: currentScore,
          reason: matchReasons.join(', ')
        });
      }
    });
    
    // Sort by score and pick the best match
    potentialMatches.sort((a, b) => b.score - a.score);
    
    if (potentialMatches.length > 0) {
      const bestMatch = potentialMatches[0];
      
      // Only consider it a definitive match if score is high enough
      if (bestMatch.score >= 80) {
        console.log(`✅ Found existing employee (score: ${bestMatch.score}): ${bestMatch.reason} - ${bestMatch.employee.first_name} ${bestMatch.employee.last_name} (ID: ${bestMatch.employee.id})`);
        
        // Log if there are multiple strong matches (potential data quality issue)
        if (potentialMatches.length > 1 && potentialMatches[1].score >= 70) {
          console.warn(`⚠️ Multiple potential matches found for employee - this might indicate data quality issues:`, 
            potentialMatches.map(m => ({ 
              name: `${m.employee.first_name} ${m.employee.last_name}`, 
              score: m.score, 
              reason: m.reason 
            }))
          );
        }
        
        return bestMatch.employee;
      } else {
        console.log(`⚠️ Potential match found but score too low (${bestMatch.score}): ${bestMatch.reason}`);
      }
    }
    
    console.log('❌ No existing employee found for imported data');
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

    // Enhanced validation
    if (!businessId) {
      throw new Error('לא נבחר עסק למיפוי - אנא בחר עסק ונסה שוב');
    }

    if (!mappings.length) {
      throw new Error('לא הוגדרו מיפויי שדות - אנא בחר לפחות שדה אחד למיפוי');
    }

    // Check for essential mappings
    const hasNameMapping = mappings.some(m => 
      (m.systemField === 'first_name' || m.systemField === 'last_name') && 
      m.mappedColumns.length > 0
    );
    
    if (!hasNameMapping) {
      throw new Error('חובה למפות לפחות שדה שם (שם פרטי או שם משפחה)');
    }

    if (!rawData || rawData.length === 0) {
      throw new Error('אין נתוני עובדים לעיבוד - הקובץ ריק מנתונים');
    }

    if (!headers || headers.length === 0) {
      throw new Error('לא נמצאו כותרות עמודות - הקובץ לא תקין');
    }

    try {
      // Create column index mapping for faster lookups
      const columnIndexMap: Record<string, number> = {};
      headers.forEach((header, index) => {
        columnIndexMap[header] = index;
      });

      console.log('📋 Column index mapping:', columnIndexMap);

      // Process raw data with improved error handling
      const previewData: PreviewEmployee[] = [];
      
      for (let rowIndex = 0; rowIndex < rawData.length; rowIndex++) {
        const row = rawData[rowIndex];
        
        console.log(`📋 Processing row ${rowIndex + 1}/${rawData.length}:`, {
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

        // Apply field mappings with better error handling
        mappings.forEach(mapping => {
          if (!mapping.mappedColumns || mapping.mappedColumns.length === 0) {
            return;
          }

          const fieldValues: string[] = [];
          
          try {
            mapping.mappedColumns.forEach(columnName => {
              const columnIndex = columnIndexMap[columnName];
              if (columnIndex !== undefined && Array.isArray(row) && columnIndex >= 0 && columnIndex < row.length) {
                const rawValue = row[columnIndex];
                const fieldValue = rawValue !== null && rawValue !== undefined ? String(rawValue).trim() : '';
                if (fieldValue && fieldValue !== '') {
                  fieldValues.push(fieldValue);
                }
              }
            });

            // Combine multiple values intelligently
            let combinedValue = '';
            if (fieldValues.length > 0) {
              if (mapping.systemField === 'first_name' || mapping.systemField === 'last_name') {
                combinedValue = fieldValues[0]; // Use first non-empty value
              } else if (mapping.systemField === 'address') {
                combinedValue = fieldValues.join(', '); // Combine addresses
              } else if (mapping.systemField === 'phone') {
                combinedValue = fieldValues[0]; // Use first phone
              } else {
                combinedValue = fieldValues.join(' ').trim(); // Default combination
              }
            }
            
            if (combinedValue && combinedValue !== '') {
              if (mapping.isCustomField) {
                employee.customFields[mapping.systemField] = combinedValue;
              } else {
                employee[mapping.systemField] = combinedValue;
              }
            }
          } catch (error) {
            console.error(`💥 Error mapping ${mapping.systemField} for row ${rowIndex + 1}:`, error);
          }
        });

        // Set default employee type
        if (!employee.employee_type) {
          employee.employee_type = 'permanent';
        }

        // Enhanced duplicate detection and validation
        const existingEmployee = findExistingEmployee(employee);
        const validationErrors = [];
        
        if (existingEmployee) {
          employee.isDuplicate = false;
          employee.isPartialUpdate = true;
          employee.existingEmployeeId = existingEmployee.id;
          
          // Count fields that can be updated
          let fieldsToUpdate = 0;
          const updateableFields = [
            'first_name', 'last_name', 'email', 'phone', 'id_number', 
            'employee_id', 'address', 'hire_date', 'employee_type', 
            'weekly_hours_required', 'main_branch_id', 'notes'
          ];
          
          updateableFields.forEach(field => {
            const importValue = employee[field];
            const existingValue = existingEmployee[field];
            
            if ((!existingValue || existingValue === '' || existingValue === null) && 
                importValue !== undefined && importValue !== null && importValue !== '') {
              fieldsToUpdate++;
            }
          });
          
          if (fieldsToUpdate > 0) {
            validationErrors.push(`עדכון חלקי - יתווספו ${fieldsToUpdate} שדות חסרים`);
          } else {
            validationErrors.push(`עובד קיים - כל השדות כבר מלאים`);
            employee.isValid = false;
          }
          
          // Merge existing data for display
          Object.keys(existingEmployee).forEach(field => {
            if (field !== 'id' && (!employee[field] || employee[field] === '')) {
              employee[field] = existingEmployee[field];
            }
          });
          
        } else {
          // New employee validation
          const hasName = (employee.first_name && employee.first_name.trim()) || 
                         (employee.last_name && employee.last_name.trim());
          const hasEmail = employee.email && employee.email.trim();
          
          if (!hasName && !hasEmail) {
            validationErrors.push('חובה לציין שם פרטי, שם משפחה או אימייל');
            employee.isValid = false;
          }
        }

        // Email validation
        if (employee.email && employee.email.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(employee.email)) {
            validationErrors.push('כתובת מייל לא תקינה');
            employee.isValid = false;
          }
        }

        // Branch validation
        if (employee.main_branch_id) {
          const branch = branches.find(b => 
            b.id === employee.main_branch_id || 
            b.name.toLowerCase() === employee.main_branch_id.toLowerCase()
          );
          if (branch) {
            employee.main_branch_id = branch.id;
          } else {
            validationErrors.push('סניף לא נמצא במערכת');
            employee.main_branch_id = null;
          }
        }

        employee.validationErrors = validationErrors;
        
        if (validationErrors.some(error => 
          !error.includes('עדכון חלקי') && 
          !error.includes('עובד קיים') && 
          !error.includes('סניף לא נמצא')
        )) {
          employee.isValid = false;
        }

        const displayName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 
                           employee.email || `שורה ${rowIndex + 1}`;

        console.log(`✅ Processed employee "${displayName}":`, {
          isValid: employee.isValid,
          isDuplicate: employee.isDuplicate,
          isPartialUpdate: employee.isPartialUpdate,
          existingEmployeeId: employee.existingEmployeeId,
          errorsCount: employee.validationErrors?.length || 0,
          businessId: employee.business_id
        });

        previewData.push(employee as PreviewEmployee);
      }

      console.log('📊 Field mapping completed:', {
        totalRows: rawData.length,
        processedEmployees: previewData.length,
        validEmployees: previewData.filter(emp => emp.isValid).length,
        newEmployees: previewData.filter(emp => !emp.isPartialUpdate && emp.isValid).length,
        partialUpdateEmployees: previewData.filter(emp => emp.isPartialUpdate && emp.isValid).length,
        errorEmployees: previewData.filter(emp => !emp.isValid).length,
        businessId
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
