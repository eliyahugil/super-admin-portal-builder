
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface FieldMappingListProps {
  mappings: FieldMapping[];
  fileColumns: string[];
  systemFields: Array<{ value: string; label: string }>;
  onUpdateMapping: (mappingId: string, updates: Partial<FieldMapping>) => void;
  onRemoveMapping: (mappingId: string) => void;
  onAddSystemField?: (newField: { value: string; label: string }) => Promise<boolean>;
}

export const FieldMappingList: React.FC<FieldMappingListProps> = ({
  mappings,
  fileColumns,
  systemFields,
  onUpdateMapping,
  onRemoveMapping,
  onAddSystemField,
}) => {
  console.log('🗂️ FieldMappingList rendering with:', {
    mappingsCount: mappings.length,
    fileColumnsCount: fileColumns.length,
    systemFieldsCount: systemFields.length
  });

  const handleColumnMapping = (mappingId: string, columnName: string) => {
    console.log('🔄 Column mapping changed:', mappingId, columnName);
    
    if (columnName === 'none') {
      onUpdateMapping(mappingId, { mappedColumns: [] });
    } else {
      onUpdateMapping(mappingId, { mappedColumns: [columnName] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        בחר איזה עמודה מהקובץ תתאים לכל שדה במערכת:
      </div>

      {mappings.map((mapping) => (
        <Card key={mapping.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {mapping.label || mapping.systemField}
                {mapping.isRequired && (
                  <Badge variant="destructive" className="text-xs">
                    חובה
                  </Badge>
                )}
                {mapping.isCustomField && (
                  <Badge variant="secondary" className="text-xs">
                    שדה מותאם
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveMapping(mapping.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  עמודה מהקובץ:
                </label>
                <Select
                  value={mapping.mappedColumns?.[0] || 'none'}
                  onValueChange={(value) => handleColumnMapping(mapping.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עמודה מהקובץ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">לא ממופה</SelectItem>
                    {fileColumns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {mapping.mappedColumns && mapping.mappedColumns.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ממופה ל: {mapping.mappedColumns.join(', ')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {onAddSystemField && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="py-6">
            <Button
              variant="outline"
              onClick={() => {
                const fieldName = prompt('שם השדה החדש:');
                if (fieldName) {
                  onAddSystemField({
                    value: fieldName.toLowerCase().replace(/\s+/g, '_'),
                    label: fieldName
                  });
                }
              }}
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              הוסף שדה מותאם
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
