
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, XCircle } from 'lucide-react';

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

interface ValidationIssuesTableProps {
  validationErrors: ValidationError[];
  duplicateErrors: DuplicateError[];
}

export const ValidationIssuesTable: React.FC<ValidationIssuesTableProps> = ({
  validationErrors,
  duplicateErrors,
}) => {
  const hasAnyIssues = validationErrors.length > 0 || duplicateErrors.length > 0;

  if (!hasAnyIssues) {
    return null;
  }

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

  return (
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
  );
};
