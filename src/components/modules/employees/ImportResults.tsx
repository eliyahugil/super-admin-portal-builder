
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Users, FileText, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/ui/BackButton';

interface ImportError {
  row: number;
  employee: string;
  error: string;
}

interface ImportedEmployee {
  name: string;
  email?: string;
  branch?: string;
}

interface ImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  skippedCount?: number;
  duplicateCount?: number;
  message: string;
  errors?: ImportError[];
  importedEmployees?: ImportedEmployee[];
}

interface ImportResultsProps {
  result: ImportResult;
  onClose: () => void;
  onBackToMapping?: () => void;
}

export const ImportResults: React.FC<ImportResultsProps> = ({ result, onClose, onBackToMapping }) => {
  const totalProcessed = result.importedCount + result.errorCount + (result.skippedCount || 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Back Button */}
      {onBackToMapping && (
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={onBackToMapping}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            חזור למיפוי שדות
          </Button>
        </div>
      )}

      {/* Status Header */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
          result.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {result.success ? (
            <CheckCircle className="h-8 w-8" />
          ) : (
            <XCircle className="h-8 w-8" />
          )}
        </div>
        <h2 className={`text-2xl font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
          {result.success ? 'הייבוא הושלם בהצלחה!' : 'הייבוא הושלם עם שגיאות'}
        </h2>
        <p className="text-gray-600 mt-2">{result.message}</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalProcessed}</div>
          <div className="text-sm text-blue-800">סה"כ נעבדו</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{result.importedCount}</div>
          <div className="text-sm text-green-800">יובאו בהצלחה</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{result.errorCount}</div>
          <div className="text-sm text-red-800">שגיאות</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{result.duplicateCount || 0}</div>
          <div className="text-sm text-yellow-800">כפילויות</div>
        </div>
      </div>

      {/* Success Alert */}
      {result.success && result.importedCount > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            יובאו בהצלחה {result.importedCount} עובדים חדשים למערכת.
            {result.duplicateCount && result.duplicateCount > 0 && (
              <span className="block mt-1">
                {result.duplicateCount} עובדים נדלגו בגלל כפילויות.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Imported Employees List */}
      {result.importedEmployees && result.importedEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              עובדים שיובאו בהצלחה ({result.importedEmployees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {result.importedEmployees.map((employee, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{employee.name}</span>
                    {employee.email && (
                      <span className="text-gray-600 text-sm mr-2">• {employee.email}</span>
                    )}
                  </div>
                  {employee.branch && (
                    <Badge variant="secondary" className="text-xs">
                      {employee.branch}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors List */}
      {result.errors && result.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              שגיאות בייבוא ({result.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {result.errors.map((error, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-red-800">שורה {error.row}</span>
                    <Badge variant="destructive" className="text-xs">
                      שגיאה
                    </Badge>
                  </div>
                  <div className="text-sm text-red-700 mb-1">
                    עובד: {error.employee}
                  </div>
                  <div className="text-sm text-red-600">
                    {error.error}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        {onBackToMapping && result.errorCount > 0 && (
          <Button
            variant="outline"
            onClick={onBackToMapping}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            תקן מיפוי ונסה שוב
          </Button>
        )}
        <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
          סיום
        </Button>
      </div>

      {/* Info Card */}
      {result.errorCount > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">טיפים לפתרון שגיאות:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>וודא שכל השדות החובה מכילים נתונים תקינים</li>
                  <li>בדוק שכתובות המייל בפורמט נכון</li>
                  <li>ודא שאין כפילויות בתעודות זהות או מספרי עובדים</li>
                  <li>בדוק שהסניפים הרשומים קיימים במערכת</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
