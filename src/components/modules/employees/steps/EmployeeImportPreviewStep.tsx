
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, XCircle, AlertTriangle, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { PreviewEmployee } from '@/hooks/useEmployeeImport/types';

interface EmployeeImportPreviewStepProps {
  previewData: PreviewEmployee[];
  onConfirm: () => void;
  onBackToMapping: () => void;
  isImporting: boolean;
}

export const EmployeeImportPreviewStep: React.FC<EmployeeImportPreviewStepProps> = ({
  previewData,
  onConfirm,
  onBackToMapping,
  isImporting,
}) => {
  const [showAllValid, setShowAllValid] = React.useState(false);
  const [showAllInvalid, setShowAllInvalid] = React.useState(false);

  const validEmployees = previewData.filter(emp => emp.isValid && !emp.isDuplicate);
  const duplicateEmployees = previewData.filter(emp => emp.isDuplicate);
  const invalidEmployees = previewData.filter(emp => !emp.isValid);

  const getDisplayName = (employee: PreviewEmployee) => {
    const firstName = employee.first_name?.trim() || '';
    const lastName = employee.last_name?.trim() || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return employee.email || employee.phone || 'לא הוגדר שם';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBackToMapping}
          disabled={isImporting}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          חזור למיפוי
        </Button>
        <h2 className="text-xl font-semibold">תצוגה מקדימה - {previewData.length} עובדים</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{previewData.length}</div>
          <div className="text-sm text-blue-800">סה"כ שורות</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{validEmployees.length}</div>
          <div className="text-sm text-green-800">תקינים</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{duplicateEmployees.length}</div>
          <div className="text-sm text-yellow-800">כפילויות</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{invalidEmployees.length}</div>
          <div className="text-sm text-red-800">שגיאות</div>
        </div>
      </div>

      {/* Status Alert */}
      {validEmployees.length > 0 ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {validEmployees.length} עובדים מוכנים לייבוא.
            {duplicateEmployees.length > 0 && ` ${duplicateEmployees.length} עובדים יידלגו בגלל כפילויות.`}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            אין עובדים תקינים לייבוא. אנא בדוק את מיפוי השדות ותקן את השגיאות.
          </AlertDescription>
        </Alert>
      )}

      {/* Valid Employees Preview */}
      {validEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              עובדים לייבוא ({validEmployees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validEmployees.slice(0, showAllValid ? validEmployees.length : 10).map((employee, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                  <div className="flex-1">
                    <div className="font-medium text-green-800">{getDisplayName(employee)}</div>
                    <div className="text-sm text-green-600 mt-1">
                      {employee.email && <span>📧 {employee.email}</span>}
                      {employee.email && employee.phone && <span className="mx-2">•</span>}
                      {employee.phone && <span>📱 {employee.phone}</span>}
                      {(employee.email || employee.phone) && employee.employee_id && <span className="mx-2">•</span>}
                      {employee.employee_id && <span>🆔 {employee.employee_id}</span>}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    מוכן לייבוא
                  </Badge>
                </div>
              ))}
              
              {validEmployees.length > 10 && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAllValid(!showAllValid)}
                    className="flex items-center gap-2 text-green-600"
                  >
                    {showAllValid ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        הצג פחות
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        הצג את כל {validEmployees.length} העובדים
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invalid Employees */}
      {invalidEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              עובדים עם שגיאות ({invalidEmployees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invalidEmployees.slice(0, showAllInvalid ? invalidEmployees.length : 5).map((employee, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-red-800">
                      {getDisplayName(employee) || `שורה ${index + 2}`}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      שגיאה
                    </Badge>
                  </div>
                  <div className="text-sm text-red-600">
                    {employee.validationErrors?.join(', ') || 'שגיאה לא ידועה'}
                  </div>
                </div>
              ))}
              
              {invalidEmployees.length > 5 && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAllInvalid(!showAllInvalid)}
                    className="flex items-center gap-2 text-red-600"
                  >
                    {showAllInvalid ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        הצג פחות
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        הצג את כל {invalidEmployees.length} השגיאות
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBackToMapping}
          disabled={isImporting}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          חזור למיפוי
        </Button>
        
        <Button 
          onClick={onConfirm} 
          disabled={validEmployees.length === 0 || isImporting}
          className="min-w-32"
        >
          {isImporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              מייבא...
            </>
          ) : (
            `ייבא ${validEmployees.length} עובדים`
          )}
        </Button>
      </div>
    </div>
  );
};
