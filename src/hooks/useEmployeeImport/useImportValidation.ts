
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { ExcelRow } from '@/services/ExcelImportService';
import { FieldMapping } from '@/components/modules/employees/types/FieldMappingTypes';
import { validateEmployeeData, validateBusinessId, sanitizeEmployeeData } from '@/utils/employeeValidation';

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
  const [currentValidationErrors, setCurrentValidationErrors] = useState<ValidationError[]>([]);
  const [currentDuplicateErrors, setCurrentDuplicateErrors] = useState<DuplicateError[]>([]);

  const validateImportData = () => {
    console.log('Starting comprehensive validation...');
    
    if (!validateBusinessId(businessId)) {
      toast({
        title: 'שגיאת הרשאה',
        description: 'לא ניתן לייבא עובדים ללא זיהוי עסק תקין',
        variant: 'destructive'
      });
      return false;
    }

    const localValidationErrors: ValidationError[] = [];
    const localDuplicateErrors: DuplicateError[] = [];

    console.log('Validating', rawData.length, 'rows of data');

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

      // Sanitize the employee data
      const sanitizedData = sanitizeEmployeeData(employeeData);

      // Validate employee data structure
      const validation = validateEmployeeData(sanitizedData, businessId!);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          localValidationErrors.push({
            rowIndex: index + 1,
            field: 'general',
            error,
            severity: 'error'
          });
        });
      }

      // Enhanced duplicate checking (רק אזהרות, לא שגיאות)
      const checkFields = [
        { field: 'email', label: 'אימייל' },
        { field: 'phone', label: 'טלפון' },
        { field: 'id_number', label: 'תעודת זהות' },
        { field: 'employee_id', label: 'מספר עובד' }
      ];
      
      checkFields.forEach(({ field, label }) => {
        if (sanitizedData[field]) {
          const isDuplicate = existingEmployees.some(emp => 
            emp[field] && emp[field].toString().trim() === sanitizedData[field].toString().trim()
          );
          
          if (isDuplicate) {
            localDuplicateErrors.push({
              rowIndex: index + 1,
              duplicateField: label,
              existingValue: sanitizedData[field],
              severity: 'warning' // Changed from 'error' to 'warning'
            });
          }
        }
      });

      // Additional business logic validations
      if (sanitizedData.hire_date) {
        const hireDate = new Date(sanitizedData.hire_date);
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        
        if (hireDate > futureDate) {
          localValidationErrors.push({
            rowIndex: index + 1,
            field: 'hire_date',
            error: 'תאריך תחילת עבודה לא יכול להיות יותר משנה קדימה',
            severity: 'warning'
          });
        }
      }

      // Validate weekly hours
      if (sanitizedData.weekly_hours_required && sanitizedData.weekly_hours_required > 168) {
        localValidationErrors.push({
          rowIndex: index + 1,
          field: 'weekly_hours_required',
          error: 'שעות שבועיות לא יכולות לעלות על 168',
          severity: 'error'
        });
      }

      // Validate employee type
      const validEmployeeTypes = ['permanent', 'temporary', 'contractor', 'intern'];
      if (sanitizedData.employee_type && !validEmployeeTypes.includes(sanitizedData.employee_type)) {
        localValidationErrors.push({
          rowIndex: index + 1,
          field: 'employee_type',
          error: 'סוג עובד לא תקין',
          severity: 'warning'
        });
      }
    });

    console.log('Validation completed:', {
      validationErrors: localValidationErrors.length,
      duplicateErrors: localDuplicateErrors.length,
      criticalErrors: localValidationErrors.filter(e => e.severity === 'error').length
    });

    // Update both local state and parent state
    setCurrentValidationErrors(localValidationErrors);
    setCurrentDuplicateErrors(localDuplicateErrors);
    setValidationErrors(localValidationErrors);
    setDuplicateErrors(localDuplicateErrors);

    // Only block import if there are critical errors (not warnings or duplicates)
    const criticalErrors = localValidationErrors.filter(e => e.severity === 'error').length;
    return criticalErrors === 0;
  };

  const getValidationSummary = () => {
    const criticalErrors = currentValidationErrors.filter(e => e.severity === 'error').length;
    const warnings = currentValidationErrors.filter(e => e.severity === 'warning').length;
    
    return {
      totalRows: rawData.length,
      validRows: rawData.length - criticalErrors, // כפילויות לא מונעות ייבוא
      errorRows: criticalErrors,
      warningRows: warnings + currentDuplicateErrors.length,
    };
  };

  return {
    validateImportData,
    getValidationSummary,
  };
};
