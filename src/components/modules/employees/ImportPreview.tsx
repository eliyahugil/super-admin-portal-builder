
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import type { PreviewEmployee } from '@/hooks/useEmployeeImport/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface ImportPreviewProps {
  previewData: PreviewEmployee[];
  onConfirm: () => void;
  onCancel: () => void;
  onBack?: () => void;
}

export const ImportPreview: React.FC<ImportPreviewProps> = ({
  previewData,
  onConfirm,
  onCancel,
  onBack,
}) => {
  const isMobile = useIsMobile();

  const validEmployees = previewData.filter(emp => emp.isValid && !emp.isDuplicate);
  const invalidEmployees = previewData.filter(emp => !emp.isValid);
  const duplicateEmployees = previewData.filter(emp => emp.isDuplicate);

  const getStatusIcon = (employee: PreviewEmployee) => {
    if (!employee.isValid) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (employee.isDuplicate) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusBadge = (employee: PreviewEmployee) => {
    if (!employee.isValid) {
      return <Badge variant="destructive">שגיאה</Badge>;
    }
    if (employee.isDuplicate) {
      return <Badge variant="secondary">כפול</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">תקין</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              חזור למיפוי
            </Button>
          )}
          <h2 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>
            תצוגה מקדימה - {previewData.length} עובדים
          </h2>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">עובדים תקינים</p>
                <p className="text-2xl font-bold text-green-600">{validEmployees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">עובדים כפולים</p>
                <p className="text-2xl font-bold text-yellow-600">{duplicateEmployees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">עובדים עם שגיאות</p>
                <p className="text-2xl font-bold text-red-600">{invalidEmployees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
            תצוגה מקדימה של העובדים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">סטטוס</TableHead>
                  <TableHead>שם מלא</TableHead>
                  <TableHead>אימייל</TableHead>
                  <TableHead>טלפון</TableHead>
                  <TableHead>סוג עובד</TableHead>
                  <TableHead>בעיות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.slice(0, 10).map((employee, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(employee)}
                        {getStatusBadge(employee)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {employee.first_name} {employee.last_name}
                    </TableCell>
                    <TableCell>{employee.email || '-'}</TableCell>
                    <TableCell>{employee.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {employee.employee_type === 'permanent' ? 'קבוע' : 
                         employee.employee_type === 'temporary' ? 'זמני' : 
                         employee.employee_type === 'contractor' ? 'קבלן' : 
                         employee.employee_type === 'youth' ? 'נוער' : 'לא ידוע'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {employee.validationErrors && employee.validationErrors.length > 0 && (
                        <div className="text-sm text-red-600">
                          {employee.validationErrors.slice(0, 2).map((error, idx) => (
                            <div key={idx}>• {error}</div>
                          ))}
                          {employee.validationErrors.length > 2 && (
                            <div>ועוד {employee.validationErrors.length - 2} בעיות...</div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {previewData.length > 10 && (
            <div className="text-sm text-gray-500 mt-4 text-center">
              מציג 10 עובדים ראשונים מתוך {previewData.length}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-row gap-4 justify-end'}`}>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className={`${isMobile ? 'w-full' : ''}`}
        >
          ביטול
        </Button>
        <Button 
          onClick={onConfirm}
          disabled={validEmployees.length === 0}
          className={`${isMobile ? 'w-full' : ''}`}
        >
          יבא {validEmployees.length} עובדים תקינים
        </Button>
      </div>

      {validEmployees.length === 0 && (
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
          <p className="text-yellow-800">אין עובדים תקינים לייבוא. אנא תקן את השגיאות ונסה שוב.</p>
        </div>
      )}
    </div>
  );
};
