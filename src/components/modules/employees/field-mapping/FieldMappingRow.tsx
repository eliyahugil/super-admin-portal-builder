
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
    <div className={`p-3 border rounded-lg bg-gray-50 ${isMobile ? 'space-y-3' : ''}`}>
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-col'} gap-3`}>
        {/* System Field Row */}
        <div className={`flex items-center ${isMobile ? 'flex-col gap-2' : 'justify-between'}`}>
          <div className={`flex items-center gap-2 flex-1 min-w-0 ${isMobile ? 'w-full justify-center' : ''}`}>
            <label className={`font-medium truncate text-center ${isMobile ? 'text-sm max-w-full' : 'text-sm'}`}>
              {mapping.isCustomField ? mapping.label : getSystemFieldLabel(mapping.systemField)}
            </label>
            <div className="flex flex-wrap items-center gap-1 justify-center">
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
          </div>
          
          {/* Action buttons - always show horizontally */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onMoveMapping(mapping.id, 'up')}
              disabled={index === 0}
              className="h-8 w-8 p-0"
              title="העבר למעלה"
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
              title="העבר למטה"
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
                title="מחק שדה"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Multi-Column Selection Row */}
        <div className="w-full">
          <div className={`text-gray-500 mb-2 text-center ${isMobile ? 'text-xs' : 'text-xs'}`}>
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
