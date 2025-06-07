
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Users, UserCheck, UserX } from 'lucide-react';

interface ImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  skippedCount?: number;
  duplicateCount?: number;
  message: string;
  errors?: Array<{
    row: number;
    employee: string;
    error: string;
  }>;
  importedEmployees?: Array<{
    name: string;
    email?: string;
    branch?: string;
  }>;
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
  const totalProcessed = result.importedCount + result.errorCount + (result.skippedCount || 0);
  
  return (
    <div className="space-y-6" dir="rtl">
      {/* Main Status Card */}
      <Card>
        <CardHeader className="text-center">
          {result.success ? (
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          )}
          <CardTitle className={result.success ? "text-green-700" : "text-red-700"}>
            {result.success ? 'ייבוא הושלם בהצלחה!' : 'ייבוא הושלם עם שגיאות'}
          </CardTitle>
          <CardDescription className="text-lg">
            {result.message}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <div className="text-2xl font-bold text-blue-600">{totalProcessed}</div>
            </div>
            <div className="text-sm text-muted-foreground">סה״כ נעבד</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <UserCheck className="h-5 w-5 text-green-600 mr-2" />
              <div className="text-2xl font-bold text-green-600">{result.importedCount}</div>
            </div>
            <div className="text-sm text-muted-foreground">יובאו בהצלחה</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <UserX className="h-5 w-5 text-red-600 mr-2" />
              <div className="text-2xl font-bold text-red-600">{result.errorCount}</div>
            </div>
            <div className="text-sm text-muted-foreground">שגיאות</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <div className="text-2xl font-bold text-yellow-600">{result.duplicateCount || 0}</div>
            </div>
            <div className="text-sm text-muted-foreground">כפילויות</div>
          </CardContent>
        </Card>
      </div>

      {/* Success Alert */}
      {result.success && result.importedCount > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>{result.importedCount} עובדים</strong> נוספו למערכת בהצלחה!
            {result.duplicateCount && result.duplicateCount > 0 && (
              <span className="block mt-1">
                {result.duplicateCount} עובדים קיימים דולגו כדי למנוע כפילויות.
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
              <UserCheck className="h-5 w-5 text-green-600" />
              עובדים שיובאו בהצלחה ({result.importedEmployees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם</TableHead>
                    <TableHead>אימייל</TableHead>
                    <TableHead>סניף</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.importedEmployees.map((employee, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.email || '-'}</TableCell>
                      <TableCell>{employee.branch || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Details */}
      {result.errors && result.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              פירוט שגיאות ({result.errors.length})
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
                  {result.errors.map((error, index) => (
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
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={onStartOver} 
          className="flex items-center gap-2"
          size="lg"
        >
          <RefreshCw className="h-4 w-4" />
          ייבא קובץ נוסף
        </Button>
        
        <Button 
          onClick={onClose}
          size="lg"
          className="min-w-32"
        >
          סיום
        </Button>
      </div>

      {/* Additional Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">מידע חשוב:</p>
              <ul className="space-y-1 text-xs">
                <li>• עובדים שיובאו בהצלחה זמינים כעת במערכת ניהול העובדים</li>
                <li>• ניתן לערוך פרטי עובדים בכל עת דרך מסך ניהול העובדים</li>
                <li>• עובדים כפולים (לפי אימייל/טלפון/ת.ז) דולגו אוטומטית</li>
                {result.errorCount > 0 && (
                  <li>• מומלץ לתקן שגיאות בקובץ המקורי ולייבא שוב</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
