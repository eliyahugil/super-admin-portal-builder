
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddSelectOptionDialog } from './AddSelectOptionDialog';

interface SelectOption {
  value: string;
  label: string;
  id?: string;
}

interface DynamicSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  onAddNew?: (newOption: { value: string; label: string }) => Promise<boolean>;
  addNewText?: string;
  addNewDialogTitle?: string;
  addNewDialogLabel?: string;
  addNewPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export const DynamicSelect: React.FC<DynamicSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "בחר אפשרות...",
  onAddNew,
  addNewText = "➕ הוסף אפשרות חדשה",
  addNewDialogTitle = "הוספת אפשרות חדשה",
  addNewDialogLabel = "שם האפשרות",
  addNewPlaceholder = "הכנס אפשרות חדשה",
  disabled = false,
  className,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === '__add_new__') {
      setShowAddDialog(true);
    } else {
      onValueChange(selectedValue);
    }
  };

  const handleAddNew = async (newOption: string): Promise<boolean> => {
    if (!onAddNew) return false;
    
    try {
      const success = await onAddNew({
        value: newOption.toLowerCase().replace(/\s+/g, '_'),
        label: newOption
      });
      
      if (success) {
        // Set the new value as selected
        const newValue = newOption.toLowerCase().replace(/\s+/g, '_');
        onValueChange(newValue);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding new option:', error);
      return false;
    }
  };

  return (
    <>
      <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id || option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          {onAddNew && (
            <>
              <div className="h-px bg-border my-1" />
              <SelectItem 
                value="__add_new__" 
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                {addNewText}
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>

      {onAddNew && (
        <AddSelectOptionDialog
          onAddOption={handleAddNew}
          placeholder={addNewPlaceholder}
          buttonText={addNewText}
          dialogTitle={addNewDialogTitle}
          optionLabel={addNewDialogLabel}
        />
      )}
    </>
  );
};
