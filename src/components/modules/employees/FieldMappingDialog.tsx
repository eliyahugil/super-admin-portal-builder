
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, GripVertical, X, ArrowUp, ArrowDown } from 'lucide-react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';
import { CustomFieldCreationSection } from './CustomFieldCreationSection';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
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

  const handleAddCustomField = (customMapping: FieldMapping) => {
    setMappings(prev => [...prev, customMapping]);
  };

  const handleRemoveMapping = (mappingId: string) => {
    setMappings(prev => prev.filter(mapping => mapping.id !== mappingId));
  };

  const handleMoveMapping = (mappingId: string, direction: 'up' | 'down') => {
    setMappings(prev => {
      const currentIndex = prev.findIndex(mapping => mapping.id === mappingId);
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newMappings = [...prev];
      [newMappings[currentIndex], newMappings[newIndex]] = [newMappings[newIndex], newMappings[currentIndex]];
      return newMappings;
    });
  };

  const handleConfirm = () => {
    // Filter out mappings that have no columns mapped
    const validMappings = mappings.filter(mapping => mapping.mappedColumns.length > 0);
    onConfirm(validMappings);
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
      <DialogContent className={`max-w-6xl ${isMobile ? 'max-h-[95vh] w-[95vw] m-2' : 'max-h-[90vh]'} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
            מיפוי שדות - התאמת עמודות האקסל לשדות המערכת
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6">
          {/* Custom Field Creation Section */}
          <CustomFieldCreationSection onAddCustomField={handleAddCustomField} />

          {/* Field Mapping Section */}
          <Card>
            <CardHeader>
              <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>התאמת שדות</CardTitle>
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                ניתן לגרור כדי לשנות סדר, להוסיף שדות מותאמים, ולהסיר שדות לא נחוצים
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mappings.map((mapping, index) => (
                  <div key={mapping.id} className={`${isMobile ? 'flex-col' : 'flex items-center'} gap-3 p-3 border rounded-lg bg-gray-50`}>
                    {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
                    {isMobile ? (
                      <>
                        {/* System Field - Mobile */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">
                              {mapping.isCustomField ? mapping.label : getSystemFieldLabel(mapping.systemField)}
                            </label>
                            {mapping.isCustomField && (
                              <Badge variant="secondary" className="text-xs">מותאם אישית</Badge>
                            )}
                            {!mapping.isCustomField && isSystemFieldRequired(mapping.systemField) && (
                              <Badge variant="destructive" className="text-xs">חובה</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveMapping(mapping.id, 'up')}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveMapping(mapping.id, 'down')}
                              disabled={index === mappings.length - 1}
                              className="h-8 w-8 p-0"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                            {mapping.isCustomField && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMapping(mapping.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* File Column Selection - Mobile */}
                        <div className="w-full">
                          <div className="text-xs text-gray-500 mb-2">עמודה מהקובץ ←</div>
                          <Select
                            value={mapping.mappedColumns[0] || 'none'}
                            onValueChange={(value) => handleMappingChange(mapping.systemField, value)}
                          >
                            <SelectTrigger className="w-full">
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
                      </>
                    ) : (
                      <>
                        {/* Desktop Layout */}
                        {/* Drag Handle */}
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveMapping(mapping.id, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveMapping(mapping.id, 'down')}
                            disabled={index === mappings.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* System Field */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm font-medium truncate">
                              {mapping.isCustomField ? mapping.label : getSystemFieldLabel(mapping.systemField)}
                            </label>
                            {mapping.isCustomField && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">מותאם אישית</Badge>
                            )}
                            {!mapping.isCustomField && isSystemFieldRequired(mapping.systemField) && (
                              <Badge variant="destructive" className="text-xs flex-shrink-0">חובה</Badge>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="text-gray-400 mx-2 flex-shrink-0">←</div>

                        {/* File Column Selection */}
                        <div className="flex-1 min-w-0">
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

                        {/* Remove Button - only for custom fields */}
                        {mapping.isCustomField && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMapping(mapping.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {sampleData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>תצוגה מקדימה של הנתונים</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {fileColumns.slice(0, isMobile ? 3 : fileColumns.length).map((column) => (
                          <TableHead key={column} className={`${isMobile ? 'min-w-[80px] text-xs' : 'min-w-[120px]'}`}>
                            {column}
                          </TableHead>
                        ))}
                        {isMobile && fileColumns.length > 3 && (
                          <TableHead className="min-w-[60px] text-xs">...</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleData.slice(0, isMobile ? 2 : 3).map((row, index) => (
                        <TableRow key={index}>
                          {fileColumns.slice(0, isMobile ? 3 : fileColumns.length).map((column) => (
                            <TableCell key={column} className={`${isMobile ? 'max-w-[80px] text-xs' : 'max-w-[200px]'} truncate`}>
                              {row[column] || '-'}
                            </TableCell>
                          ))}
                          {isMobile && fileColumns.length > 3 && (
                            <TableCell className="text-xs">...</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className={`${isMobile ? 'flex-col gap-2' : 'flex-row'}`}>
          <Button variant="outline" onClick={() => onOpenChange(false)} className={`${isMobile ? 'w-full' : ''}`}>
            ביטול
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!hasRequiredMappings}
            className={`${isMobile ? 'w-full' : ''}`}
          >
            המשך לתצוגה מקדימה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
