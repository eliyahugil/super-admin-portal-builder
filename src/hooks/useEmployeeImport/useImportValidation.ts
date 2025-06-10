
import { useEffect, useMemo } from 'react';
import type { PreviewEmployee } from '@/services/ExcelImportService';
import type { ExcelRow } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';

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
}: UseImportValidationProps) => {
  const runValidation = () => {
    console.log('🔍 Running enhanced validation on raw data:', rawData.length);
    
    const validationErrors: ValidationError[] = [];
    const duplicateErrors: DuplicateError[] = [];

    // Enhanced validation logic based on field mappings and existing data
    rawData.forEach((row, index) => {
      // Check required fields based on field mappings
      fieldMappings.forEach((mapping) => {
        if (mapping.required && mapping.excelColumn) {
          const cellValue = row[mapping.excelColumn];
          if (!cellValue || cellValue.toString().trim() === '') {
            validationErrors.push({
              rowIndex: index + 1, // 1-based for user display
              field: mapping.systemField,
              error: `שדה חובה ריק: ${mapping.systemField}`,
              severity: 'error' as const
            });
          }
        }
      });

      // Check for duplicates against existing employees
      const emailMapping = fieldMappings.find(m => m.systemField === 'email');
      if (emailMapping && emailMapping.excelColumn) {
        const email = row[emailMapping.excelColumn];
        if (email && existingEmployees.some(emp => emp.email === email)) {
          duplicateErrors.push({
            rowIndex: index + 1,
            duplicateField: 'email',
            existingValue: email.toString(),
            severity: 'warning' as const
          });
        }
      }
    });

    console.log('📊 Enhanced validation results:', {
      validationErrors: validationErrors.length,
      duplicateErrors: duplicateErrors.length
    });

    setValidationErrors(validationErrors);
    setDuplicateErrors(duplicateErrors);
  };

  const validateImportData = () => {
    // Check for critical validation errors
    const criticalErrors = rawData.filter((row, index) => {
      return fieldMappings.some((mapping) => {
        if (mapping.required && mapping.excelColumn) {
          const cellValue = row[mapping.excelColumn];
          return !cellValue || cellValue.toString().trim() === '';
        }
        return false;
      });
    });
    
    if (criticalErrors.length > 0) {
      console.warn('⚠️ Found critical validation errors, cannot proceed with import');
      return false;
    }

    if (rawData.length === 0) {
      console.warn('⚠️ No data found for import');
      return false;
    }

    console.log('✅ Enhanced validation passed, ready for import');
    return true;
  };

  const getValidationSummary = () => {
    const totalRows = rawData.length;
    const requiredFieldErrors = rawData.filter((row, index) => {
      return fieldMappings.some((mapping) => {
        if (mapping.required && mapping.excelColumn) {
          const cellValue = row[mapping.excelColumn];
          return !cellValue || cellValue.toString().trim() === '';
        }
        return false;
      });
    }).length;

    const duplicateRows = rawData.filter((row, index) => {
      const emailMapping = fieldMappings.find(m => m.systemField === 'email');
      if (emailMapping && emailMapping.excelColumn) {
        const email = row[emailMapping.excelColumn];
        return email && existingEmployees.some(emp => emp.email === email);
      }
      return false;
    }).length;

    return {
      totalRows,
      validRows: totalRows - requiredFieldErrors,
      errorRows: requiredFieldErrors,
      warningRows: duplicateRows,
    };
  };

  return {
    runValidation,
    validateImportData,
    getValidationSummary,
  };
};
