
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, X } from 'lucide-react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface FieldMappingRowProps {
  mapping: FieldMapping;
  index: number;
  mappingsLength: number;
  fileColumns: string[];
  systemFields: Array<{ value: string; label: string; required?: boolean }>;
  onMappingChange: (systemField: string, selectedColumn: string) => void;
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

  return (
    <div className={`${isMobile ? 'flex-col' : 'flex items-center'} gap-3 p-3 border rounded-lg bg-gray-50`}>
      {isMobile ? (
        <>
          {/* System Field - Mobile */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <label className="text-sm font-medium truncate max-w-[150px]">
                {mapping.isCustomField ? mapping.label : getSystemFieldLabel(mapping.systemField)}
              </label>
              {mapping.isCustomField && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">מותאם אישית</Badge>
              )}
              {!mapping.isCustomField && isSystemFieldRequired(mapping.systemField) && (
                <Badge variant="destructive" className="text-xs flex-shrink-0">חובה</Badge>
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

          {/* File Column Selection - Mobile */}
          <div className="w-full">
            <div className="text-xs text-gray-500 mb-2">עמודה מהקובץ ←</div>
            <Select
              value={mapping.mappedColumns[0] || 'none'}
              onValueChange={(value) => onMappingChange(mapping.systemField, value)}
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
          {/* Move buttons */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onMoveMapping(mapping.id, 'up')}
              disabled={index === 0}
              className="h-6 w-6 p-0"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onMoveMapping(mapping.id, 'down')}
              disabled={index === mappingsLength - 1}
              className="h-6 w-6 p-0"
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>

          {/* System Field - limited width */}
          <div className="w-48 flex-shrink-0">
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

          {/* File Column Selection - limited width */}
          <div className="w-48 flex-shrink-0">
            <Select
              value={mapping.mappedColumns[0] || 'none'}
              onValueChange={(value) => onMappingChange(mapping.systemField, value)}
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
              onClick={() => onRemoveMapping(mapping.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};
