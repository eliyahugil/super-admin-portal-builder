
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface MultiColumnSelectorProps {
  availableColumns: string[];
  selectedColumns: string[];
  onSelectionChange: (columns: string[]) => void;
  disabled?: boolean;
}

export const MultiColumnSelector: React.FC<MultiColumnSelectorProps> = ({
  availableColumns,
  selectedColumns,
  onSelectionChange,
  disabled = false,
}) => {
  const [newColumnValue, setNewColumnValue] = useState('');

  const addColumn = () => {
    if (newColumnValue && !selectedColumns.includes(newColumnValue)) {
      onSelectionChange([...selectedColumns, newColumnValue]);
      setNewColumnValue('');
    }
  };

  const removeColumn = (columnToRemove: string) => {
    onSelectionChange(selectedColumns.filter(col => col !== columnToRemove));
  };

  const getAvailableColumns = () => {
    return availableColumns.filter(col => !selectedColumns.includes(col));
  };

  return (
    <div className="space-y-2">
      {/* Selected Columns Display */}
      {selectedColumns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedColumns.map((column) => (
            <Badge
              key={column}
              variant="default"
              className="flex items-center gap-1 px-2 py-1"
            >
              {column}
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeColumn(column)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Add Column Selector */}
      {!disabled && getAvailableColumns().length > 0 && (
        <div className="flex gap-2">
          <Select
            value={newColumnValue}
            onValueChange={setNewColumnValue}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="בחר עמודה להוספה" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableColumns().map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addColumn}
            disabled={!newColumnValue}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Empty State */}
      {selectedColumns.length === 0 && !disabled && (
        <div className="text-sm text-gray-500 italic">
          לא נבחרו עמודות
        </div>
      )}
    </div>
  );
};
