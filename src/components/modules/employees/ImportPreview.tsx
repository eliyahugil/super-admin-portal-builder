
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle, User } from 'lucide-react';
import type { PreviewEmployee } from '@/hooks/useEmployeeImport/types';

interface ImportPreviewProps {
  previewData: PreviewEmployee[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const ImportPreview: React.FC<ImportPreviewProps> = ({
  previewData,
  onConfirm,
  onCancel
}) => {
  console.log('👁️ ImportPreview rendered with data:', {
    total: previewData.length,
    sample: previewData.slice(0, 2)
  });

  const validEmployees = previewData.filter(emp => emp.isValid);
  const invalidEmployees = previewData.filter(emp => !emp.isValid);
  const duplicateEmployees = previewData.filter(emp => emp.isDuplicate);

  console.log('📊 ImportPreview statistics:', {
    valid: validEmployees.length,
    invalid: invalidEmployees.length,
    duplicates: duplicateEmployees.length
  });

  const getEmployeeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      permanent: 'קבוע',
      temporary: 'זמני',
      youth: 'נוער',
      contractor: 'קבלן',
    };
    return types[type] || type;
  };

  const handleConfirm = () => {
    console.log('✅ ImportPreview - Confirm button clicked');
    onConfirm();
  };

  const handleCancel = () => {
    console.log('❌ ImportPreview - Cancel button clicked');
    onCancel();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{validEmployees.length}</div>
            <div className="text-sm text-gray-600">עובדים תקינים</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{invalidEmployees.length}</div>
            <div className="text-sm text-gray-600">עובדים עם שגיאות</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{duplicateEmployees.length}</div>
            <div className="text-sm text-gray-600">עובדים כפולים</div>
          </CardContent>
        </Card>
      </div>

      {invalidEmployees.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            נמצאו {invalidEmployees.length} שגיאות בולידציה. אנא תקן את השגיאות לפני ההמשך.
          </AlertDescription>
        </Alert>
      )}

      {duplicateEmployees.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            נמצאו {duplicateEmployees.length} עובדים כפולים. הם לא ייובאו.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">תצוגה מקדימה של העובדים</h3>
        
        <div className="max-h-96 overflow-y-auto space-y-2">
          {previewData.map((employee, index) => (
            <Card key={index} className={employee.isValid ? 'border-green-200' : 'border-red-200'}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {employee.first_name} {employee.last_name}
                      </div>
                      <div className="text-sm text-gray-600 space-x-2">
                        {employee.email && <span>{employee.email}</span>}
                        {employee.phone && <span>• {employee.phone}</span>}
                        {employee.employee_id && <span>• מספר עובד: {employee.employee_id}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={employee.isValid ? "default" : "destructive"}>
                      {getEmployeeTypeLabel(employee.employee_type)}
                    </Badge>
                    {employee.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
                
                {!employee.isValid && employee.validationErrors && (
                  <div className="mt-2 text-sm text-red-600">
                    {employee.validationErrors.join(', ')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleCancel}>
          ביטול
        </Button>
        <Button 
          onClick={handleConfirm}
          disabled={validEmployees.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          ייבא {validEmployees.length} עובדים
        </Button>
      </div>
    </div>
  );
};
