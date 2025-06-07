
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { ExcelRow } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';
import { validateEmployeeData, validateBusinessId } from '@/utils/employeeValidation';

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
  const { toast } = useToast();

  const validateImportData = () => {
    if (!validateBusinessId(businessId)) {
      toast({
        title: 'שגיאת הרשאה',
        description: 'לא ניתן לייבא עובדים ללא זיהוי עסק תקין',
        variant: 'destructive'
      });
      return false;
    }

    const validationErrors: ValidationError[] = [];
    const duplicateErrors: DuplicateError[] = [];

    rawData.forEach((row, index) => {
      // Build employee data from mappings
      const employeeData: any = { business_id: businessId };
      
      fieldMappings.forEach(mapping => {
        if (mapping.systemField && mapping.mappedColumns.length > 0) {
          const combinedValue = mapping.mappedColumns
            .map(col => row[col] || '')
            .filter(val => val !== '')
            .join(' ')
            .trim();

          if (!mapping.isCustomField) {
            employeeData[mapping.systemField] = combinedValue;
          }
        }
      });

      // Validate employee data
      const validation = validateEmployeeData(employeeData, businessId!);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          validationErrors.push({
            rowIndex: index + 1,
            field: 'general',
            error,
            severity: 'error'
          });
        });
      }

      // Check for duplicates
      const checkFields = ['email', 'phone', 'id_number', 'employee_id'];
      checkFields.forEach(field => {
        if (employeeData[field]) {
          const isDuplicate = existingEmployees.some(emp => 
            emp[field] && emp[field] === employeeData[field]
          );
          
          if (isDuplicate) {
            duplicateErrors.push({
              rowIndex: index + 1,
              duplicateField: field,
              existingValue: employeeData[field],
              severity: 'warning'
            });
          }
        }
      });

      // Additional business logic validations
      if (employeeData.hire_date) {
        const hireDate = new Date(employeeData.hire_date);
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        
        if (hireDate > futureDate) {
          validationErrors.push({
            rowIndex: index + 1,
            field: 'hire_date',
            error: 'תאריך תחילת עבודה לא יכול להיות יותר משנה קדימה',
            severity: 'warning'
          });
        }
      }
    });

    setValidationErrors(validationErrors);
    setDuplicateErrors(duplicateErrors);

    return validationErrors.filter(e => e.severity === 'error').length === 0;
  };

  const getValidationSummary = () => {
    return {
      totalRows: rawData.length,
      validRows: rawData.length - duplicateErrors.length - validationErrors.filter(e => e.severity === 'error').length,
      errorRows: validationErrors.filter(e => e.severity === 'error').length,
      warningRows: validationErrors.filter(e => e.severity === 'warning').length + duplicateErrors.length,
    };
  };

  return {
    validateImportData,
    getValidationSummary,
  };
};
