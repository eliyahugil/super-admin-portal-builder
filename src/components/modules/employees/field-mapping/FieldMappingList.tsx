
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EnhancedFieldMappingRow } from './EnhancedFieldMappingRow';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface FieldMappingListProps {
  mappings: FieldMapping[];
  fileColumns: string[];
  systemFields?: Array<{ value: string; label: string }>;
  onUpdateMapping: (mappingId: string, updates: Partial<FieldMapping>) => void;
  onRemoveMapping: (mappingId: string) => void;
  onAddSystemField?: (newField: { value: string; label: string }) => Promise<boolean>;
}

export const FieldMappingList: React.FC<FieldMappingListProps> = ({
  mappings,
  fileColumns,
  systemFields = [],
  onUpdateMapping,
  onRemoveMapping,
  onAddSystemField,
}) => {
  console.log('📋 FieldMappingList rendered with:', {
    mappingsCount: mappings.length,
    fileColumnsCount: fileColumns.length,
    systemFieldsCount: systemFields.length
  });

  if (mappings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="mb-4">לא נמצאו מיפויי שדות</p>
        <p className="text-sm">העלה קובץ כדי להתחיל במיפוי שדות</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">מיפוי שדות</h3>
        <div className="text-sm text-gray-600">
          {mappings.filter(m => m.mappedColumns.length > 0).length} מתוך {mappings.length} שדות ממופים
        </div>
      </div>

      <div className="space-y-3">
        {mappings.map((mapping) => (
          <EnhancedFieldMappingRow
            key={mapping.id}
            mapping={mapping}
            fileColumns={fileColumns}
            systemFields={systemFields}
            onUpdate={onUpdateMapping}
            onRemove={onRemoveMapping}
            onAddSystemField={onAddSystemField}
          />
        ))}
      </div>
    </div>
  );
};
