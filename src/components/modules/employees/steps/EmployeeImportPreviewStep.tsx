
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X } from 'lucide-react';
import { PreviewEmployee } from '@/services/ExcelImportService';

interface EmployeeImportPreviewStepProps {
  previewData: PreviewEmployee[];
  isImporting: boolean;
  onBackToMapping: () => void;
  onConfirmImport: () => void;
}

export const EmployeeImportPreviewStep: React.FC<EmployeeImportPreviewStepProps> = ({
  previewData,
  isImporting,
  onBackToMapping,
  onConfirmImport,
}) => {
  const validCount = previewData.filter(emp => emp.isValid && !emp.isDuplicate).length;
  const invalidCount = previewData.filter(emp => !emp.isValid).length;
  const duplicateCount = previewData.filter(emp => emp.isDuplicate).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">תצוגה מקדימה</h3>
        <div className="flex gap-2">
          <Badge variant="outline">{validCount} תקינים</Badge>
          <Badge variant="destructive">{invalidCount} שגויים</Badge>
          <Badge variant="secondary">{duplicateCount} כפולים</Badge>
        </div>
      </div>

      <div className="max-h-96 overflow-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">סטטוס</TableHead>
              <TableHead>שורה</TableHead>
              <TableHead>שם</TableHead>
              <TableHead>אימייל</TableHead>
              <TableHead>טלפון</TableHead>
              <TableHead>שדות מותאמים</TableHead>
              <TableHead>שגיאות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((employee) => (
              <TableRow key={employee.rowIndex}>
                <TableCell>
                  {employee.isDuplicate ? (
                    <Badge variant="secondary">כפול</Badge>
                  ) : employee.isValid ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </TableCell>
                <TableCell>{employee.rowIndex}</TableCell>
                <TableCell>
                  {`${employee.data.first_name || ''} ${employee.data.last_name || ''}`.trim()}
                </TableCell>
                <TableCell>{employee.data.email}</TableCell>
                <TableCell>{employee.data.phone}</TableCell>
                <TableCell>
                  {Object.keys(employee.customFields).length > 0 ? (
                    <Badge variant="outline">
                      {Object.keys(employee.customFields).length} שדות
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {employee.errors.length > 0 && (
                    <div className="text-red-600 text-xs">
                      {employee.errors.join(', ')}
                    </div>
                  )}
                  {employee.isDuplicate && (
                    <div className="text-orange-600 text-xs">
                      עובד כבר קיים במערכת
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBackToMapping}>
          חזור למיפוי
        </Button>
        <Button 
          onClick={onConfirmImport} 
          disabled={isImporting || validCount === 0}
        >
          {isImporting ? 'מייבא...' : 'ייבא עובדים'}
        </Button>
      </div>
    </div>
  );
};
