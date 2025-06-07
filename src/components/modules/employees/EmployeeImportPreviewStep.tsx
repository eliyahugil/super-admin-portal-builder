
import React from 'react';
import { EmployeeValidationResults } from './EmployeeValidationResults';
import { PreviewEmployee } from '@/services/ExcelImportService';

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

interface EmployeeImportPreviewStepProps {
  previewData: PreviewEmployee[];
  validationErrors: ValidationError[];
  duplicateErrors: DuplicateError[];
  summary: ValidationSummary;
  isImporting: boolean;
  onBackToMapping: () => void;
  onConfirmImport: () => void;
}

export const EmployeeImportPreviewStep: React.FC<EmployeeImportPreviewStepProps> = ({
  previewData,
  validationErrors,
  duplicateErrors,
  summary,
  isImporting,
  onBackToMapping,
  onConfirmImport,
}) => {
  return (
    <EmployeeValidationResults
      validationErrors={validationErrors}
      duplicateErrors={duplicateErrors}
      summary={summary}
      onContinueImport={onConfirmImport}
      onBackToMapping={onBackToMapping}
      isImporting={isImporting}
    />
  );
};
