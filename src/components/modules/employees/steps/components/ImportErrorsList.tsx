
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { XCircle } from 'lucide-react';

interface ImportError {
  row: number;
  employee: string;
  error: string;
}

interface ImportErrorsListProps {
  errors: ImportError[];
}

export const ImportErrorsList: React.FC<ImportErrorsListProps> = ({
  errors,
}) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <XCircle className="h-5 w-5" />
          פירוט שגיאות ({errors.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-48 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שורה</TableHead>
                <TableHead>עובד</TableHead>
                <TableHead>שגיאה</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.map((error, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-center">{error.row}</TableCell>
                  <TableCell className="font-medium">{error.employee}</TableCell>
                  <TableCell className="text-red-600">{error.error}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
