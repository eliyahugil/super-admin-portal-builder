
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportError {
  row: number;
  employee: string;
  error: string;
}

interface ImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  message: string;
  errors: ImportError[];
  importedEmployees: any[];
}

interface ImportResultsProps {
  result: ImportResult | null;
  onClose: () => void;
}

export const ImportResults: React.FC<ImportResultsProps> = ({ result, onClose }) => {
  if (!result) {
    return <div>אין תוצאות זמינות</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        {result.success ? (
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        )}
        <h3 className="text-2xl font-bold mb-2">
          {result.success ? 'הייבוא הושלם בהצלחה!' : 'הייבוא נכשל'}
        </h3>
        <p className="text-gray-600">{result.message}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{result.importedCount}</div>
            <div className="text-sm text-gray-600">עובדים יובאו</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{result.errorCount}</div>
            <div className="text-sm text-gray-600">שגיאות</div>
          </CardContent>
        </Card>
      </div>

      {result.errors && result.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              שגיאות בייבוא
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {result.errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertDescription>
                    שורה {error.row}: {error.employee} - {error.error}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={onClose}>
          סגור
        </Button>
      </div>
    </div>
  );
};
