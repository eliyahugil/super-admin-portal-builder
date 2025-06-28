
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Layers, Plus } from 'lucide-react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface PreviewTableHeaderProps {
  mappings: FieldMapping[];
  systemFields: Array<{ value: string; label: string }>;
}

export const PreviewTableHeader: React.FC<PreviewTableHeaderProps> = ({
  mappings,
  systemFields,
}) => {
  const activeMappings = mappings.filter(m => m.mappedColumns.length > 0);

  const getFieldLabel = (mapping: FieldMapping) => {
    const systemField = systemFields.find(f => f.value === mapping.systemField);
    return systemField?.label || mapping.label || mapping.systemField;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-16">#</TableHead>
        {activeMappings.map((mapping) => (
          <TableHead key={mapping.systemField} className="min-w-32">
            <div className="space-y-1">
              <div className="font-medium">
                {getFieldLabel(mapping)}
                {mapping.isRequired && (
                  <span className="text-red-500 mr-1">*</span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {mapping.isCustomField && (
                  <Badge variant="default" className="text-xs bg-green-600">
                    <Plus className="h-2 w-2 mr-1" />
                    מותאם
                  </Badge>
                )}
                
                {mapping.mappedColumns.length > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    <Layers className="h-2 w-2 mr-1" />
                    {mapping.mappedColumns.length} עמודות
                  </Badge>
                )}
              </div>
              
              <div className="text-xs text-gray-500 font-normal">
                {mapping.mappedColumns.join(' + ')}
              </div>
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};
