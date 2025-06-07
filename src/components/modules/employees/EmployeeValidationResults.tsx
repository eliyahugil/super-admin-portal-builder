
import React from 'react';
import { ValidationSummaryStats } from './steps/components/ValidationSummaryStats';
import { ValidationStatusAlert } from './steps/components/ValidationStatusAlert';
import { ValidationIssuesTable } from './steps/components/ValidationIssuesTable';
import { ValidationActionButtons } from './steps/components/ValidationActionButtons';
import { EmptyValidationState } from './steps/components/EmptyValidationState';

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

interface ValidationSummary {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
}

interface EmployeeValidationResultsProps {
  validationErrors: ValidationError[];
  duplicateErrors: DuplicateError[];
  summary: ValidationSummary;
  onContinueImport: () => void;
  onBackToMapping: () => void;
  isImporting?: boolean;
}

export const EmployeeValidationResults: React.FC<EmployeeValidationResultsProps> = ({
  validationErrors,
  duplicateErrors,
  summary,
  onContinueImport,
  onBackToMapping,
  isImporting = false,
}) => {
  const hasCriticalErrors = validationErrors.some(e => e.severity === 'error');
  const hasAnyIssues = validationErrors.length > 0 || duplicateErrors.length > 0;

  if (!hasAnyIssues && summary.totalRows === 0) {
    return <EmptyValidationState onBackToMapping={onBackToMapping} />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <ValidationSummaryStats summary={summary} />

      <ValidationStatusAlert 
        summary={summary} 
        hasCriticalErrors={hasCriticalErrors} 
      />

      <ValidationIssuesTable 
        validationErrors={validationErrors}
        duplicateErrors={duplicateErrors}
      />

      <ValidationActionButtons
        summary={summary}
        hasCriticalErrors={hasCriticalErrors}
        isImporting={isImporting}
        onBackToMapping={onBackToMapping}
        onContinueImport={onContinueImport}
      />
    </div>
  );
};
