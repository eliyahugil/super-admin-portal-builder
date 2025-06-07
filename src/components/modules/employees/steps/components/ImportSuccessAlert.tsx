
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface ImportSuccessAlertProps {
  importedCount: number;
  duplicateCount?: number;
}

export const ImportSuccessAlert: React.FC<ImportSuccessAlertProps> = ({
  importedCount,
  duplicateCount,
}) => {
  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <strong>{importedCount} עובדים</strong> נוספו למערכת בהצלחה!
        {duplicateCount && duplicateCount > 0 && (
          <span className="block mt-1">
            {duplicateCount} עובדים קיימים דולגו כדי למנוע כפילויות.
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
};
