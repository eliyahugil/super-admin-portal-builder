
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';
import { getSystemFieldLabel } from './PreviewDataGenerator';

interface PreviewTableHeaderProps {
  mappings: FieldMapping[];
  systemFields: Array<{ value: string; label: string }>;
}

export const PreviewTableHeader: React.FC<PreviewTableHeaderProps> = ({
  mappings,
  systemFields,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-16">#</TableHead>
        {mappings.map((mapping) => (
          <TableHead key={mapping.id} className="min-w-[150px]">
            <div className="space-y-1">
              <div className="font-medium">
                {getSystemFieldLabel(mapping, systemFields)}
              </div>
              <div className="text-xs text-gray-500">
                {mapping.mappedColumns?.join(' + ') || 'לא ממופה'}
              </div>
              {mapping.isCustomField && (
                <Badge variant="secondary" className="text-xs">
                  שדה מותאם
                </Badge>
              )}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};
