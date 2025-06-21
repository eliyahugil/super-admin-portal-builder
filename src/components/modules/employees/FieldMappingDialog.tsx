
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileColumns: string[];
  sampleData: any[];
  onConfirm: (mappings: FieldMapping[]) => void;
  systemFields?: Array<{ value: string; label: string; required?: boolean }>;
}

const defaultSystemFields = [
  { value: 'first_name', label: 'שם פרטי', required: true },
  { value: 'last_name', label: 'שם משפחה', required: true },
  { value: 'email', label: 'אימייל', required: false },
  { value: 'phone', label: 'טלפון', required: false },
  { value: 'id_number', label: 'תעודת זהות', required: false },
  { value: 'employee_id', label: 'מספר עובד', required: false },
  { value: 'address', label: 'כתובת', required: false },
  { value: 'hire_date', label: 'תאריך התחלה', required: false },
  { value: 'employee_type', label: 'סוג עובד', required: false },
  { value: 'weekly_hours_required', label: 'שעות שבועיות', required: false },
  { value: 'main_branch_id', label: 'סניף ראשי', required: false },
  { value: 'notes', label: 'הערות', required: false },
];

export const FieldMappingDialog: React.FC<FieldMappingDialogProps> = ({
  open,
  onOpenChange,
  fileColumns,
  sampleData,
  onConfirm,
  systemFields = defaultSystemFields,
}) => {
  const [mappings, setMappings] = useState<FieldMapping[]>(() => {
    return systemFields.map((field, index) => ({
      id: `mapping-${field.value}-${Date.now()}-${index}`,
      systemField: field.value,
      mappedColumns: [],
      isRequired: field.required || false,
      label: field.label,
      isCustomField: false,
    }));
  });

  const handleMappingChange = (systemField: string, selectedColumn: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.systemField === systemField 
        ? { ...mapping, mappedColumns: selectedColumn && selectedColumn !== 'none' ? [selectedColumn] : [] }
        : mapping
    ));
  };

  const handleConfirm = () => {
    onConfirm(mappings);
  };

  const getSystemFieldLabel = (systemField: string) => {
    const field = systemFields.find(f => f.value === systemField);
    return field?.label || systemField;
  };

  const isSystemFieldRequired = (systemField: string) => {
    const field = systemFields.find(f => f.value === systemField);
    return field?.required || false;
  };

  const hasRequiredMappings = mappings
    .filter(m => isSystemFieldRequired(m.systemField))
    .every(m => m.mappedColumns.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>מיפוי שדות - התאמת עמודות האקסל לשדות המערכת</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Field Mapping Section */}
          <Card>
            <CardHeader>
              <CardTitle>התאמת שדות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mappings.map((mapping) => (
                  <div key={mapping.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">
                        {getSystemFieldLabel(mapping.systemField)}
                      </label>
                      {isSystemFieldRequired(mapping.systemField) && (
                        <Badge variant="destructive" className="text-xs">חובה</Badge>
                      )}
                    </div>
                    <Select
                      value={mapping.mappedColumns[0] || 'none'}
                      onValueChange={(value) => handleMappingChange(mapping.systemField, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר עמודה מהקובץ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">ללא מיפוי</SelectItem>
                        {fileColumns.map((column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {sampleData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>תצוגה מקדימה של הנתונים</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {fileColumns.map((column) => (
                          <TableHead key={column} className="min-w-[120px]">
                            {column}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleData.slice(0, 3).map((row, index) => (
                        <TableRow key={index}>
                          {fileColumns.map((column) => (
                            <TableCell key={column} className="max-w-[200px] truncate">
                              {row[column] || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!hasRequiredMappings}
          >
            המשך לתצוגה מקדימה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
