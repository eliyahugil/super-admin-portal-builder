
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Link } from 'lucide-react';
import { FieldMapping } from '@/hooks/useEmployeeImport/types';
import { MultiColumnSelector } from './MultiColumnSelector';

interface FieldMappingRowProps {
  mapping: FieldMapping;
  fileColumns: string[];
  systemFields: Array<{ value: string; label: string }>;
  onUpdate: (updates: Partial<FieldMapping>) => void;
  onRemove: () => void;
}

export const FieldMappingRow: React.FC<FieldMappingRowProps> = ({
  mapping,
  fileColumns,
  systemFields,
  onUpdate,
  onRemove,
}) => {
  const handleSystemFieldChange = (value: string) => {
    onUpdate({
      systemField: value,
      isCustomField: value.startsWith('custom:'),
    });
  };

  const handleColumnsChange = (columns: string[]) => {
    onUpdate({ mappedColumns: columns });
  };

  const getSystemFieldLabel = () => {
    if (mapping.isCustomField && mapping.customFieldName) {
      return mapping.customFieldName;
    }
    
    const field = systemFields.find(f => f.value === mapping.systemField);
    return field ? field.label : mapping.systemField;
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
      {/* System Field Selection */}
      <div className="flex-1">
        <div className="text-sm font-medium mb-2">שדה במערכת</div>
        {mapping.isCustomField ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Link className="h-3 w-3" />
              {getSystemFieldLabel()}
            </Badge>
          </div>
        ) : (
          <Select
            value={mapping.systemField}
            onValueChange={handleSystemFieldChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר שדה במערכת" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">לא ממופה</SelectItem>
              {systemFields.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Arrow */}
      <div className="text-gray-400">
        ←
      </div>

      {/* File Columns Selection */}
      <div className="flex-1">
        <div className="text-sm font-medium mb-2">עמודות מהקובץ</div>
        <MultiColumnSelector
          availableColumns={fileColumns}
          selectedColumns={mapping.mappedColumns}
          onSelectionChange={handleColumnsChange}
          disabled={!mapping.systemField}
        />
      </div>

      {/* Remove Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
