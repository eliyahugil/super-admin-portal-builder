
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { DynamicSelect } from '@/components/ui/DynamicSelect';
import { MultiColumnSelector } from './MultiColumnSelector';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface EnhancedFieldMappingRowProps {
  mapping: FieldMapping;
  fileColumns: string[];
  systemFields: Array<{ value: string; label: string }>;
  onUpdate: (mappingId: string, updates: Partial<FieldMapping>) => void;
  onRemove: (mappingId: string) => void;
  onAddSystemField?: (newField: { value: string; label: string }) => Promise<boolean>;
}

export const EnhancedFieldMappingRow: React.FC<EnhancedFieldMappingRowProps> = ({
  mapping,
  fileColumns,
  systemFields,
  onUpdate,
  onRemove,
  onAddSystemField,
}) => {
  const handleSystemFieldChange = (value: string) => {
    // Find the field in systemFields to get the label
    const field = systemFields.find(f => f.value === value);
    onUpdate(mapping.id, {
      systemField: value,
      label: field?.label || value,
      isCustomField: !field // If field is not in systemFields, it's custom
    });
  };

  const handleColumnChange = (columns: string[]) => {
    onUpdate(mapping.id, { mappedColumns: columns });
  };

  const handleAddSystemField = async (newField: { value: string; label: string }): Promise<boolean> => {
    if (!onAddSystemField) return false;
    
    try {
      const success = await onAddSystemField(newField);
      if (success) {
        // Update this mapping to use the new field
        onUpdate(mapping.id, {
          systemField: newField.value,
          label: newField.label,
          isCustomField: true
        });
      }
      return success;
    } catch (error) {
      console.error('Error adding system field:', error);
      return false;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
      <div>
        <Label className="text-sm font-medium mb-2 block">
          שדה במערכת
          {mapping.isRequired && <span className="text-red-500 mr-1">*</span>}
        </Label>
        <DynamicSelect
          value={mapping.systemField}
          onValueChange={handleSystemFieldChange}
          options={systemFields}
          placeholder="בחר שדה במערכת..."
          onAddNew={onAddSystemField}
          addNewText="➕ הוסף שדה מותאם"
          addNewDialogTitle="הוספת שדה מותאם חדש"
          addNewDialogLabel="שם השדה"
          addNewPlaceholder="לדוגמה: תאריך לידה"
          className="w-full"
        />
        {mapping.isCustomField && (
          <p className="text-xs text-blue-600 mt-1">שדה מותאם</p>
        )}
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          עמודות מהקובץ
        </Label>
        <div className="flex items-center gap-2">
          <MultiColumnSelector
            columns={fileColumns}
            selectedColumns={mapping.mappedColumns}
            onSelectionChange={handleColumnChange}
            placeholder="בחר עמודות..."
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(mapping.id)}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {mapping.mappedColumns.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            נבחרו: {mapping.mappedColumns.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};
