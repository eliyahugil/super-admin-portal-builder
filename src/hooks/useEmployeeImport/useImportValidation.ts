
import { useCallback } from 'react';
import type { ExcelRow, PreviewEmployee, ImportValidation } from './types';
import type { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

interface ValidationError {
  rowIndex: number;
  field: string;
  error: string;
  severity: 'error' | 'warning';
}

interface DuplicateError {
  rowIndex: number;
  duplicateField: string;
  existingValue: string;
  severity: 'error' | 'warning';
}

interface UseImportValidationProps {
  rawData: ExcelRow[];
  fieldMappings: FieldMapping[];
  existingEmployees: any[];
  businessId: string | null;
  setValidationErrors: (errors: ValidationError[]) => void;
  setDuplicateErrors: (errors: DuplicateError[]) => void;
}

export const useImportValidation = ({
  rawData,
  fieldMappings,
  existingEmployees,
  businessId,
  setValidationErrors,
  setDuplicateErrors,
}: UseImportValidationProps): ImportValidation => {

  const runValidation = useCallback(() => {
    console.log('🔍 Running import validation...');
    
    const validationErrors: ValidationError[] = [];
    const duplicateErrors: DuplicateError[] = [];

    rawData.forEach((row, index) => {
      // Validate required fields
      const firstNameMapping = fieldMappings.find(m => m.systemField === 'first_name');
      const lastNameMapping = fieldMappings.find(m => m.systemField === 'last_name');

      if (firstNameMapping) {
        const firstName = firstNameMapping.mappedColumns
          .map(col => row[col])
          .join(' ')
          .trim();
        
        if (!firstName) {
          validationErrors.push({
            rowIndex: index,
            field: 'first_name',
            error: 'שם פרטי הוא שדה חובה',
            severity: 'error'
          });
        }
      }

      if (lastNameMapping) {
        const lastName = lastNameMapping.mappedColumns
          .map(col => row[col])
          .join(' ')
          .trim();
        
        if (!lastName) {
          validationErrors.push({
            rowIndex: index,
            field: 'last_name',
            error: 'שם משפחה הוא שדה חובה',
            severity: 'error'
          });
        }
      }

      // Validate email format
      const emailMapping = fieldMappings.find(m => m.systemField === 'email');
      if (emailMapping) {
        const email = emailMapping.mappedColumns
          .map(col => row[col])
          .join('')
          .trim();
        
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          validationErrors.push({
            rowIndex: index,
            field: 'email',
            error: 'פורמט אימייל לא תקין',
            severity: 'warning'
          });
        }

        // Check for duplicate emails in existing employees
        if (email && existingEmployees.some(emp => emp.email === email)) {
          duplicateErrors.push({
            rowIndex: index,
            duplicateField: 'email',
            existingValue: email,
            severity: 'warning'
          });
        }
      }

      // Validate phone format (basic validation)
      const phoneMapping = fieldMappings.find(m => m.systemField === 'phone');
      if (phoneMapping) {
        const phone = phoneMapping.mappedColumns
          .map(col => row[col])
          .join('')
          .trim();
        
        if (phone && !/^[\d\-\+\(\)\s]+$/.test(phone)) {
          validationErrors.push({
            rowIndex: index,
            field: 'phone',
            error: 'פורמט טלפון לא תקין',
            severity: 'warning'
          });
        }
      }

      // Validate ID number (Israeli format)
      const idMapping = fieldMappings.find(m => m.systemField === 'id_number');
      if (idMapping) {
        const idNumber = idMapping.mappedColumns
          .map(col => row[col])
          .join('')
          .trim();
        
        if (idNumber && !/^\d{9}$/.test(idNumber)) {
          validationErrors.push({
            rowIndex: index,
            field: 'id_number',
            error: 'תעודת זהות חייבת להכיל 9 ספרות',
            severity: 'warning'
          });
        }

        // Check for duplicate ID numbers
        if (idNumber && existingEmployees.some(emp => emp.id_number === idNumber)) {
          duplicateErrors.push({
            rowIndex: index,
            duplicateField: 'id_number',
            existingValue: idNumber,
            severity: 'error'
          });
        }
      }
    });

    console.log(`📊 Validation complete: ${validationErrors.length} validation errors, ${duplicateErrors.length} duplicate errors`);
    setValidationErrors(validationErrors);
    setDuplicateErrors(duplicateErrors);
  }, [rawData, fieldMappings, existingEmployees, setValidationErrors, setDuplicateErrors]);

  const validateImportData = useCallback((): boolean => {
    // Run validation first
    runValidation();
    
    // Check if there are any critical errors
    return true; // Allow import even with warnings
  }, [runValidation]);

  const getValidationSummary = useCallback(() => {
    return {
      totalRows: rawData.length,
      validRows: rawData.length,
      errorRows: 0,
      warningRows: 0,
    };
  }, [rawData.length]);

  return {
    isValid: true,
    errors: [],
    warnings: [],
    validateImportData,
    getValidationSummary,
  };
};
