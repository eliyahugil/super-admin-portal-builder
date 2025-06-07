
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, AlertTriangle, XCircle, FileX } from 'lucide-react';

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

  // Combine all errors for the table display
  const allIssues = [
    ...validationErrors.map(error => ({
      rowIndex: error.rowIndex,
      field: error.field,
      message: error.error,
      type: 'validation' as const,
      severity: error.severity
    })),
    ...duplicateErrors.map(duplicate => ({
      rowIndex: duplicate.rowIndex,
      field: duplicate.duplicateField,
      message: `כפילות: ${duplicate.existingValue}`,
      type: 'duplicate' as const,
      severity: duplicate.severity
    }))
  ].sort((a, b) => a.rowIndex - b.rowIndex);

  const getSeverityIcon = (severity: 'error' | 'warning') => {
    return severity === 'error' ? (
      <XCircle className="h-4 w-4 text-red-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
    );
  };

  const getSeverityBadge = (severity: 'error' | 'warning') => {
    return (
      <Badge variant={severity === 'error' ? 'destructive' : 'secondary'}>
        {severity === 'error' ? 'שגיאה' : 'אזהרה'}
      </Badge>
    );
  };

  const getStatusAlert = () => {
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
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            נמצאו {summary.warningRows} אזהרות. ניתן להמשיך בייבוא אך מומלץ לבדוק את הנתונים.
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

  if (!hasAnyIssues && summary.totalRows === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileX className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">אין נתונים לבדיקה</h3>
          <p className="text-muted-foreground text-center mb-4">
            לא נמצאו נתונים תקינים לייבוא. אנא בדוק את הקובץ והמיפוי.
          </p>
          <Button variant="outline" onClick={onBackToMapping}>
            חזור למיפוי
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.totalRows}</div>
            <div className="text-sm text-muted-foreground">סה״כ שורות</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{summary.validRows}</div>
            <div className="text-sm text-muted-foreground">תקינות</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.warningRows}</div>
            <div className="text-sm text-muted-foreground">אזהרות</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{summary.errorRows}</div>
            <div className="text-sm text-muted-foreground">שגיאות</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      {getStatusAlert()}

      {/* Issues Table */}
      {hasAnyIssues && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              פירוט בעיות ({allIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">שורה</TableHead>
                    <TableHead>שדה</TableHead>
                    <TableHead>הודעה</TableHead>
                    <TableHead>סוג</TableHead>
                    <TableHead className="w-20">חומרה</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allIssues.map((issue, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-center">
                        {issue.rowIndex}
                      </TableCell>
                      <TableCell className="font-medium">
                        {issue.field}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(issue.severity)}
                          {issue.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {issue.type === 'validation' ? 'וולידציה' : 'כפילות'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(issue.severity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBackToMapping} disabled={isImporting}>
          חזור למיפוי
        </Button>
        
        <Button 
          onClick={onContinueImport} 
          disabled={hasCriticalErrors || isImporting || summary.validRows === 0}
          className="min-w-32"
        >
          {isImporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              מייבא...
            </>
          ) : (
            `ייבא ${summary.validRows} עובדים`
          )}
        </Button>
      </div>
    </div>
  );
};
