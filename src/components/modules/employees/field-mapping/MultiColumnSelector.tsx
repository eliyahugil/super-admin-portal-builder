
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, X } from 'lucide-react';

interface MultiColumnSelectorProps {
  availableColumns: string[];
  selectedColumns: string[];
  onSelectionChange: (columns: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
}

export const MultiColumnSelector: React.FC<MultiColumnSelectorProps> = ({
  availableColumns,
  selectedColumns,
  onSelectionChange,
  placeholder = "בחר עמודות...",
  maxSelections = 5
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColumnToggle = (column: string) => {
    const isSelected = selectedColumns.includes(column);
    
    if (isSelected) {
      // Remove column
      onSelectionChange(selectedColumns.filter(col => col !== column));
    } else {
      // Add column (if under limit)
      if (selectedColumns.length < maxSelections) {
        onSelectionChange([...selectedColumns, column]);
      }
    }
  };

  const removeColumn = (column: string) => {
    onSelectionChange(selectedColumns.filter(col => col !== column));
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
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between text-right"
          >
            {displayText}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-60 overflow-y-auto">
            <div className="p-2 border-b bg-gray-50">
              <div className="text-sm text-gray-600">
                בחר עד {maxSelections} עמודות ({selectedColumns.length}/{maxSelections})
              </div>
            </div>
            <div className="p-2 space-y-1">
              {availableColumns.map((column) => {
                const isSelected = selectedColumns.includes(column);
                const isDisabled = !isSelected && selectedColumns.length >= maxSelections;
                
                return (
                  <div
                    key={column}
                    className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => !isDisabled && handleColumnToggle(column)}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => handleColumnToggle(column)}
                    />
                    <span className="flex-1 text-sm">{column}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected columns display */}
      {selectedColumns.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedColumns.map((column) => (
            <Badge key={column} variant="secondary" className="text-xs">
              {column}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => removeColumn(column)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
