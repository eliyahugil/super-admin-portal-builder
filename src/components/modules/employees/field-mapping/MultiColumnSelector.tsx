
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown } from 'lucide-react';

interface MultiColumnSelectorProps {
  availableColumns: string[];
  selectedColumns: string[];
  onSelectionChange: (columns: string[]) => void;
  onAddColumn?: (column: string) => void;
  onRemoveColumn?: (column: string) => void;
  placeholder?: string;
}

export const MultiColumnSelector: React.FC<MultiColumnSelectorProps> = ({
  availableColumns,
  selectedColumns,
  onSelectionChange,
  onAddColumn,
  onRemoveColumn,
  placeholder = "בחר עמודות..."
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColumnToggle = (column: string) => {
    const newSelection = selectedColumns.includes(column)
      ? selectedColumns.filter(col => col !== column)
      : [...selectedColumns, column];
    
    onSelectionChange(newSelection);
    
    // Support for legacy props
    if (selectedColumns.includes(column) && onRemoveColumn) {
      onRemoveColumn(column);
    } else if (!selectedColumns.includes(column) && onAddColumn) {
      onAddColumn(column);
    }
  };

  const displayText = selectedColumns.length > 0 
    ? `נבחרו ${selectedColumns.length} עמודות`
    : placeholder;

  return (
    <div className="w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            size="sm"
          >
            <span className="truncate">{displayText}</span>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align="start">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableColumns.map((column) => (
              <div key={column} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column}`}
                  checked={selectedColumns.includes(column)}
                  onCheckedChange={() => handleColumnToggle(column)}
                />
                <label
                  htmlFor={`column-${column}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  {column}
                </label>
              </div>
            ))}
          </div>
          {selectedColumns.length > 0 && (
            <div className="mt-3 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectionChange([])}
                className="w-full"
              >
                נקה בחירה
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      
      {selectedColumns.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedColumns.map((column) => (
            <Badge key={column} variant="secondary" className="text-xs">
              {column}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
