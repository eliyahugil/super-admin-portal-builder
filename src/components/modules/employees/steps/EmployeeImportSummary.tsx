
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface ImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  message: string;
}

interface EmployeeImportSummaryProps {
  result: ImportResult;
  onStartOver: () => void;
  onClose: () => void;
}

export const EmployeeImportSummary: React.FC<EmployeeImportSummaryProps> = ({
  result,
  onStartOver,
  onClose,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          {result.success ? (
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          )}
          <CardTitle className={result.success ? "text-green-700" : "text-red-700"}>
            {result.success ? 'ייבוא הושלם בהצלחה!' : 'הייבוא נכשל'}
          </CardTitle>
          <CardDescription>
            {result.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <Badge variant="outline" className="text-green-700 bg-green-50">
                {result.importedCount} עובדים יובאו
              </Badge>
            </div>
            <div>
              <Badge variant="outline" className="text-red-700 bg-red-50">
                {result.errorCount} שגיאות
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onStartOver} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          התחל מחדש
        </Button>
        <Button onClick={onClose}>
          סגור
        </Button>
      </div>
    </div>
  );
};
