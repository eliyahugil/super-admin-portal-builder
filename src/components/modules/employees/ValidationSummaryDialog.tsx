
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

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

interface ValidationSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validationErrors: ValidationError[];
  duplicateErrors: DuplicateError[];
  summary: ValidationSummary;
}

export const ValidationSummaryDialog: React.FC<ValidationSummaryDialogProps> = ({
  open,
  onOpenChange,
  validationErrors,
  duplicateErrors,
  summary,
}) => {
  const allErrors = [...validationErrors, ...duplicateErrors.map(d => ({
    rowIndex: d.rowIndex,
    field: d.duplicateField,
    error: `כפילות בשדה ${d.duplicateField}: ${d.existingValue}`,
    severity: d.severity
  }))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            סיכום בדיקת תקינות הנתונים
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.totalRows}</div>
              <div className="text-sm text-blue-800">סה״כ שורות</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.validRows}</div>
              <div className="text-sm text-green-800">שורות תקינות</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{summary.warningRows}</div>
              <div className="text-sm text-yellow-800">אזהרות</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{summary.errorRows}</div>
              <div className="text-sm text-red-800">שגיאות</div>
            </div>
          </div>

          {/* Status Alert */}
          {summary.errorRows > 0 ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                נמצאו {summary.errorRows} שגיאות קריטיות שמונעות ייבוא. אנא תקן את השגיאות ונסה שוב.
              </AlertDescription>
            </Alert>
          ) : summary.warningRows > 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                נמצאו {summary.warningRows} אזהרות. ניתן להמשיך בייבוא אך מומלץ לבדוק את הנתונים.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                כל הנתונים תקינים ומוכנים לייבוא!
              </AlertDescription>
            </Alert>
          )}

          {/* Errors Table */}
          {allErrors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">פירוט שגיאות ואזהרות</h3>
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>שורה</TableHead>
                      <TableHead>שדה</TableHead>
                      <TableHead>תיאור</TableHead>
                      <TableHead>רמת חומרה</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allErrors.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{error.rowIndex}</TableCell>
                        <TableCell>{error.field}</TableCell>
                        <TableCell>{error.error}</TableCell>
                        <TableCell>
                          <Badge variant={error.severity === 'error' ? 'destructive' : 'secondary'}>
                            {error.severity === 'error' ? 'שגיאה' : 'אזהרה'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              סגור
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
