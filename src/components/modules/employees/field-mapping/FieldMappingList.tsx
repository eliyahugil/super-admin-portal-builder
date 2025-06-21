
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldMappingRow } from './FieldMappingRow';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface FieldMappingListProps {
  mappings: FieldMapping[];
  fileColumns: string[];
  systemFields: Array<{ value: string; label: string; required?: boolean }>;
  onMappingChange: (systemField: string, selectedColumns: string[]) => void;
  onMoveMapping: (mappingId: string, direction: 'up' | 'down') => void;
  onRemoveMapping: (mappingId: string) => void;
  getSystemFieldLabel: (systemField: string) => string;
  isSystemFieldRequired: (systemField: string) => boolean;
}

export const FieldMappingList: React.FC<FieldMappingListProps> = ({
  mappings,
  fileColumns,
  systemFields,
  onMappingChange,
  onMoveMapping,
  onRemoveMapping,
  getSystemFieldLabel,
  isSystemFieldRequired,
}) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>התאמת שדות</CardTitle>
        <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          ניתן לגרור כדי לשנות סדר, לבחור מספר עמודות לכל שדה, להוסיף שדות מותאמים, ולהסיר שדות לא נחוצים
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mappings.map((mapping, index) => (
            <FieldMappingRow
              key={mapping.id}
              mapping={mapping}
              index={index}
              mappingsLength={mappings.length}
              fileColumns={fileColumns}
              systemFields={systemFields}
              onMappingChange={onMappingChange}
              onMoveMapping={onMoveMapping}
              onRemoveMapping={onRemoveMapping}
              getSystemFieldLabel={getSystemFieldLabel}
              isSystemFieldRequired={isSystemFieldRequired}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
