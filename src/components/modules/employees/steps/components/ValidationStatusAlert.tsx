
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ValidationSummary {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
}

interface ValidationStatusAlertProps {
  summary: ValidationSummary;
  hasCriticalErrors: boolean;
}

export const ValidationStatusAlert: React.FC<ValidationStatusAlertProps> = ({
  summary,
  hasCriticalErrors,
}) => {
  if (hasCriticalErrors) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          נמצאו {summary.errorRows} שגיאות קריטיות שמונעות את הייבוא. אנא תקן את השגיאות ונסה שוב.
        </AlertDescription>
      </Alert>
    );
  }

  if (summary.warningRows > 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          נמצאו {summary.warningRows} אזהרות וכפילויות. 
          <strong> הייבוא ימשיך עם upsert אוטומטי</strong> - עובדים קיימים יעודכנו במקום להיווצר מחדש.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        כל הנתונים תקינים ומוכנים לייבוא!
      </AlertDescription>
    </Alert>
  );
};
