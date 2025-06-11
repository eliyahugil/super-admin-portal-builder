
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Users } from 'lucide-react';

interface ImportResultsProps {
  result: any;
  onClose: () => void;
}

export const ImportResults: React.FC<ImportResultsProps> = ({ result, onClose }) => {
  const handleClose = () => {
    onClose();
    // Trigger a custom event to refresh the employees list
    window.dispatchEvent(new CustomEvent('employeesImported'));
  };

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
            <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
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
              <AlertTriangle className="h-5 w-5 text-red-500" />
              שגיאות בייבוא
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {result.errors.map((error: any, index: number) => (
                <Alert key={index} variant="destructive">
                  <AlertDescription>
                    שורה {error.row}: {error.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result.importedEmployees && result.importedEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              עובדים שיובאו בהצלחה
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {result.importedEmployees.map((employee: any, index: number) => (
                <div key={index} className="p-2 bg-green-50 rounded border border-green-200">
                  <div className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </div>
                  {employee.email && (
                    <div className="text-sm text-gray-600">{employee.email}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={handleClose} className="px-8">
          סגור
        </Button>
      </div>
    </div>
  );
};
