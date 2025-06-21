
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface MultiColumnSelectorProps {
  selectedColumns: string[];
  availableColumns: string[];
  onAddColumn: (column: string) => void;
  onRemoveColumn: (column: string) => void;
  placeholder?: string;
}

export const MultiColumnSelector: React.FC<MultiColumnSelectorProps> = ({
  selectedColumns,
  availableColumns,
  onAddColumn,
  onRemoveColumn,
  placeholder = "בחר עמודה"
}) => {
  // Filter out already selected columns
  const unselectedColumns = availableColumns.filter(
    column => !selectedColumns.includes(column)
  );

  return (
    <div className="space-y-2">
      {/* Show selected columns */}
      {selectedColumns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedColumns.map((column) => (
            <Badge key={column} variant="secondary" className="flex items-center gap-1">
              {column}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveColumn(column)}
                className="h-4 w-4 p-0 text-gray-500 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add new column selector */}
      {unselectedColumns.length > 0 && (
        <div className="flex items-center gap-2">
          <Select
            value=""
            onValueChange={(value) => {
              if (value && value !== 'none') {
                onAddColumn(value);
              }
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">ללא בחירה</SelectItem>
              {unselectedColumns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Plus className="h-4 w-4 text-gray-400" />
        </div>
      )}

      {/* Show message when no columns available */}
      {selectedColumns.length === 0 && unselectedColumns.length === 0 && (
        <div className="text-sm text-gray-500 p-2 border border-dashed rounded">
          כל העמודות כבר נבחרו
        </div>
      )}
    </div>
  );
};
