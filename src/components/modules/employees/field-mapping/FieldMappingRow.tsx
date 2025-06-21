
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, X } from 'lucide-react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { MultiColumnSelector } from './MultiColumnSelector';

interface FieldMappingRowProps {
  mapping: FieldMapping;
  index: number;
  mappingsLength: number;
  fileColumns: string[];
  systemFields: Array<{ value: string; label: string; required?: boolean }>;
  onMappingChange: (systemField: string, selectedColumns: string[]) => void;
  onMoveMapping: (mappingId: string, direction: 'up' | 'down') => void;
  onRemoveMapping: (mappingId: string) => void;
  getSystemFieldLabel: (systemField: string) => string;
  isSystemFieldRequired: (systemField: string) => boolean;
}

export const FieldMappingRow: React.FC<FieldMappingRowProps> = ({
  mapping,
  index,
  mappingsLength,
  fileColumns,
  onMappingChange,
  onMoveMapping,
  onRemoveMapping,
  getSystemFieldLabel,
  isSystemFieldRequired,
}) => {
  const isMobile = useIsMobile();

  const handleSelectionChange = (columns: string[]) => {
    onMappingChange(mapping.systemField, columns);
  };

  return (
    <div className="p-3 border rounded-lg bg-gray-50">
      <div className="flex flex-col gap-3">
        {/* System Field Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className={`font-medium truncate ${isMobile ? 'text-sm max-w-[180px]' : 'text-sm'}`}>
              {mapping.isCustomField ? mapping.label : getSystemFieldLabel(mapping.systemField)}
            </label>
            {mapping.isCustomField && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">מותאם אישית</Badge>
            )}
            {!mapping.isCustomField && isSystemFieldRequired(mapping.systemField) && (
              <Badge variant="destructive" className="text-xs flex-shrink-0">חובה</Badge>
            )}
            {mapping.mappedColumns.length > 1 && (
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {mapping.mappedColumns.length} עמודות
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onMoveMapping(mapping.id, 'up')}
              disabled={index === 0}
              className="h-8 w-8 p-0"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onMoveMapping(mapping.id, 'down')}
              disabled={index === mappingsLength - 1}
              className="h-8 w-8 p-0"
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
            {mapping.isCustomField && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveMapping(mapping.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Multi-Column Selection Row */}
        <div className="w-full">
          <div className="text-xs text-gray-500 mb-2">
            עמודות מהקובץ ← (ניתן לבחור מספר עמודות)
          </div>
          <MultiColumnSelector
            selectedColumns={mapping.mappedColumns}
            availableColumns={fileColumns}
            onSelectionChange={handleSelectionChange}
            placeholder="הוסף עמודה נוספת..."
          />
        </div>
      </div>
    </div>
  );
};
