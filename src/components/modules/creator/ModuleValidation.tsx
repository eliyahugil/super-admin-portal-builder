
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { validateModuleName } from '@/utils/moduleUtils';
import type { CustomField, SubModule } from '@/utils/moduleTypes';

interface ModuleValidationProps {
  moduleName: string;
  fields: CustomField[];
  subModules: SubModule[];
}

interface ValidationIssue {
  type: 'error' | 'warning' | 'success';
  message: string;
}

export const ModuleValidation: React.FC<ModuleValidationProps> = ({
  moduleName,
  fields,
  subModules
}) => {
  const getValidationIssues = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    // Validate module name
    const nameValidation = validateModuleName(moduleName);
    if (!nameValidation.isValid) {
      issues.push({
        type: 'error',
        message: nameValidation.error || 'שם המודל לא תקין'
      });
    } else if (moduleName.trim()) {
      issues.push({
        type: 'success',
        message: 'שם המודל תקין'
      });
    }

    // Validate fields
    if (fields.length === 0) {
      issues.push({
        type: 'error',
        message: 'יש להוסיף לפחות שדה אחד למודל'
      });
    } else {
      // Check for empty field names
      const emptyFields = fields.filter(field => !field.name.trim());
      if (emptyFields.length > 0) {
        issues.push({
          type: 'error',
          message: `יש ${emptyFields.length} שדות ללא שם`
        });
      } else {
        issues.push({
          type: 'success',
          message: `נוספו ${fields.length} שדות תקינים`
        });
      }

      // Check for duplicate field names
      const fieldNames = fields.map(f => f.name.trim().toLowerCase());
      const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        issues.push({
          type: 'error',
          message: 'יש שדות עם שמות זהים'
        });
      }
    }

    // Validate sub-modules if any
    if (subModules.length > 0) {
      const invalidSubModules = subModules.filter(sub => !sub.name.trim() || !sub.route.trim());
      if (invalidSubModules.length > 0) {
        issues.push({
          type: 'error',
          message: `יש ${invalidSubModules.length} תת-מודלים ללא שם או נתיב`
        });
      } else {
        issues.push({
          type: 'success',
          message: `נוספו ${subModules.length} תת-מודלים תקינים`
        });
      }

      // Check for duplicate sub-module routes
      const subRoutes = subModules.map(s => s.route.trim().toLowerCase());
      const duplicateRoutes = subRoutes.filter((route, index) => subRoutes.indexOf(route) !== index);
      if (duplicateRoutes.length > 0) {
        issues.push({
          type: 'error',
          message: 'יש תת-מודלים עם נתיבים זהים'
        });
      }
    }

    return issues;
  };

  const issues = getValidationIssues();
  const hasErrors = issues.some(issue => issue.type === 'error');
  const hasSuccess = issues.some(issue => issue.type === 'success');

  if (issues.length === 0) return null;

  return (
    <div className="space-y-2">
      {issues.map((issue, index) => (
        <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
          {issue.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={issue.type === 'success' ? 'text-green-700' : ''}>
            {issue.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export const useModuleValidation = (
  moduleName: string,
  fields: CustomField[],
  subModules: SubModule[]
) => {
  const nameValidation = validateModuleName(moduleName);
  
  const hasValidName = nameValidation.isValid;
  const hasValidFields = fields.length > 0 && fields.every(field => field.name.trim());
  const hasValidSubModules = subModules.length === 0 || subModules.every(sub => sub.name.trim() && sub.route.trim());
  
  // Check for duplicates
  const fieldNames = fields.map(f => f.name.trim().toLowerCase());
  const hasDuplicateFields = fieldNames.length !== new Set(fieldNames).size;
  
  const subRoutes = subModules.map(s => s.route.trim().toLowerCase());
  const hasDuplicateSubRoutes = subRoutes.length !== new Set(subRoutes).size;
  
  const isValid = hasValidName && hasValidFields && hasValidSubModules && !hasDuplicateFields && !hasDuplicateSubRoutes;
  
  return {
    isValid,
    hasValidName,
    hasValidFields,
    hasValidSubModules,
    hasDuplicateFields,
    hasDuplicateSubRoutes,
    nameError: nameValidation.error
  };
};
