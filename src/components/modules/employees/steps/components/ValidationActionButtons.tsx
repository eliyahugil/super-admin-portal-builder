
import React from 'react';
import { Button } from '@/components/ui/button';

interface ValidationSummary {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
}

interface ValidationActionButtonsProps {
  summary: ValidationSummary;
  hasCriticalErrors: boolean;
  isImporting: boolean;
  onBackToMapping: () => void;
  onContinueImport: () => void;
}

export const ValidationActionButtons: React.FC<ValidationActionButtonsProps> = ({
  summary,
  hasCriticalErrors,
  isImporting,
  onBackToMapping,
  onContinueImport,
}) => {
  const canProceed = !hasCriticalErrors && summary.validRows > 0;
  
  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={onBackToMapping} disabled={isImporting}>
        חזור למיפוי
      </Button>
      
      <Button 
        onClick={onContinueImport} 
        disabled={!canProceed || isImporting}
        className="min-w-32"
      >
        {isImporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            מייבא...
          </>
        ) : (
          `ייבא ${summary.validRows} עובדים${summary.warningRows > 0 ? ' (עם upsert)' : ''}`
        )}
      </Button>
    </div>
  );
};
