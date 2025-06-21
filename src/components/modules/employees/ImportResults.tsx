
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import type { ImportResult } from '@/hooks/useEmployeeImport/types';

interface ImportResultsProps {
  result: ImportResult | null;
  onClose: () => void;
  onBackToMapping?: () => void;
}

export const ImportResults: React.FC<ImportResultsProps> = ({
  result,
  onClose,
  onBackToMapping,
}) => {
  if (!result) {
    return null;
  }

  const hasErrors = result.errors && result.errors.length > 0;
  const hasImportedEmployees = result.importedCount > 0;

  return (
    <div className="space-y-6">
      {/* כותרת עם כפתור חזרה */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">תוצאות הייבוא</h2>
        {onBackToMapping && hasErrors && (
          <Button
            variant="outline"
            onClick={onBackToMapping}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            חזור למיפוי שדות
          </Button>
        )}
      </div>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">יובאו בהצלחה</p>
                <p className="text-2xl font-bold text-green-600">{result.importedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">שגיאות</p>
                <p className="text-2xl font-bold text-red-600">{result.errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">סה"כ</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result.importedCount + result.errorCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* הודעת סטטוס */}
      <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <AlertCircle className={`h-4 w-4 ${result.success ? "text-green-600" : "text-red-600"}`} />
        <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
          {result.message}
        </AlertDescription>
      </Alert>

      {/* שגיאות מפורטות */}
      {hasErrors && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              שגיאות בייבוא ({result.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {result.errors.slice(0, 10).map((error, index) => (
                <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-red-800">
                        שורה {error.row}: {error.employee}
                      </p>
                      <p className="text-sm text-red-600 mt-1">{error.error}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      שגיאה
                    </Badge>
                  </div>
                </div>
              ))}
              {result.errors.length > 10 && (
                <p className="text-sm text-gray-500 text-center">
                  ועוד {result.errors.length - 10} שגיאות נוספות...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* עובדים שיובאו בהצלחה */}
      {hasImportedEmployees && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              עובדים שיובאו בהצלחה ({result.importedCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {result.importedEmployees.slice(0, 5).map((employee, index) => (
                <div key={index} className="p-2 border border-green-200 rounded bg-green-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-800">{employee.name}</span>
                    <Badge variant="default" className="bg-green-500 text-xs">
                      הושלם
                    </Badge>
                  </div>
                  {employee.email && (
                    <p className="text-sm text-green-600">{employee.email}</p>
                  )}
                </div>
              ))}
              {result.importedEmployees.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  ועוד {result.importedEmployees.length - 5} עובדים...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* כפתורי פעולה */}
      <div className="flex gap-4 justify-end">
        {onBackToMapping && hasErrors && (
          <Button
            variant="outline"
            onClick={onBackToMapping}
            className="flex items-center gap-2 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            <RefreshCw className="h-4 w-4" />
            נסה שוב עם מיפוי מתוקן
          </Button>
        )}
        <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
          סגור
        </Button>
      </div>
    </div>
  );
};
