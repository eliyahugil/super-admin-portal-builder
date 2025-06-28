
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Edit2, Layers } from 'lucide-react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface PreviewTableRowProps {
  row: Record<string, any>;
  rowIndex: number;
  mappings: FieldMapping[];
  businessId?: string;
  editingCell: string | null;
  editValues: Record<string, string>;
  onEditStart: (cellKey: string) => void;
  onEditSave: (cellKey: string) => void;
  onEditCancel: (cellKey: string) => void;
  onEditValueChange: (cellKey: string, value: string) => void;
}

export const PreviewTableRow: React.FC<PreviewTableRowProps> = ({
  row,
  rowIndex,
  mappings,
  businessId,
  editingCell,
  editValues,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditValueChange,
}) => {
  const activeMappings = mappings.filter(m => m.mappedColumns.length > 0);

  const getCellValue = (mapping: FieldMapping) => {
    const fieldData = row[mapping.systemField];
    if (typeof fieldData === 'object' && fieldData && 'value' in fieldData) {
      return fieldData.value || '';
    }
    return fieldData || '';
  };

  const getCellKey = (fieldName: string) => `${rowIndex}-${fieldName}`;

  const renderEditableCell = (mapping: FieldMapping) => {
    const cellKey = getCellKey(mapping.systemField);
    const currentValue = getCellValue(mapping);
    const isEditing = editingCell === cellKey;
    const editValue = editValues[cellKey] ?? currentValue;
    const fieldData = row[mapping.systemField];
    const isMultiColumn = typeof fieldData === 'object' && fieldData?.isMultiColumn;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={editValue}
            onChange={(e) => onEditValueChange(cellKey, e.target.value)}
            className="text-sm h-8"
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-green-600"
            onClick={() => onEditSave(cellKey)}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-red-600"
            onClick={() => onEditCancel(cellKey)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div className="group relative">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm">
              {currentValue || (
                <span className="text-gray-400 italic">ריק</span>
              )}
            </div>
            {isMultiColumn && (
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Layers className="h-2 w-2 mr-1" />
                  {fieldData.sourceColumns?.length || 0} עמודות
                </Badge>
              </div>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-blue-600"
            onClick={() => onEditStart(cellKey)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <TableRow>
      <TableCell className="font-mono text-sm text-center text-gray-500">
        {rowIndex + 1}
      </TableCell>
      {activeMappings.map((mapping) => (
        <TableCell key={mapping.systemField} className="min-w-32">
          {renderEditableCell(mapping)}
        </TableCell>
      ))}
    </TableRow>
  );
};
