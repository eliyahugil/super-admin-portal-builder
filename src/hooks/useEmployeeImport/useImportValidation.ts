
import { useEffect, useMemo } from 'react';
import type { PreviewEmployee } from '@/services/ExcelImportService';

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

export const useImportValidation = (
  previewData: PreviewEmployee[],
  setValidationErrors: (errors: ValidationError[]) => void,
  setDuplicateErrors: (errors: DuplicateError[]) => void
) => {
  const runValidation = () => {
    console.log('🔍 Running validation on preview data:', previewData.length);
    
    const validationErrors: ValidationError[] = [];
    const duplicateErrors: DuplicateError[] = [];

    previewData.forEach((employee) => {
      // Add validation errors
      employee.errors.forEach((error) => {
        validationErrors.push({
          rowIndex: employee.rowIndex,
          field: 'general',
          error,
          severity: 'error' as const
        });
      });

      // Add warnings as validation errors with warning severity
      employee.warnings.forEach((warning) => {
        validationErrors.push({
          rowIndex: employee.rowIndex,
          field: 'general',
          error: warning,
          severity: 'warning' as const
        });
      });

      // Add duplicate errors if employee is marked as duplicate
      if (employee.isDuplicate) {
        duplicateErrors.push({
          rowIndex: employee.rowIndex,
          duplicateField: 'email', // This could be more specific
          existingValue: employee.data.email || 'N/A',
          severity: 'warning' as const
        });
      }
    });

    console.log('📊 Validation results:', {
      validationErrors: validationErrors.length,
      duplicateErrors: duplicateErrors.length
    });

    setValidationErrors(validationErrors);
    setDuplicateErrors(duplicateErrors);
  };

  const validateImportData = () => {
    const criticalErrors = previewData.filter(emp => !emp.isValid);
    
    if (criticalErrors.length > 0) {
      console.warn('⚠️ Found critical errors, cannot proceed with import');
      return false;
    }

    const validEmployees = previewData.filter(emp => emp.isValid);
    if (validEmployees.length === 0) {
      console.warn('⚠️ No valid employees found for import');
      return false;
    }

    console.log('✅ Validation passed, ready for import');
    return true;
  };

  const getValidationSummary = () => {
    const totalRows = previewData.length;
    const validRows = previewData.filter(emp => emp.isValid && !emp.isDuplicate).length;
    const errorRows = previewData.filter(emp => !emp.isValid).length;
    const warningRows = previewData.filter(emp => emp.hasWarnings).length;

    return {
      totalRows,
      validRows,
      errorRows,
      warningRows,
    };
  };

  return {
    runValidation,
    validateImportData,
    getValidationSummary,
  };
};
