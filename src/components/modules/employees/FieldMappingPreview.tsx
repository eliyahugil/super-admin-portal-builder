
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FieldMapping } from './FieldMappingDialog';

interface FieldMappingPreviewProps {
  mappings: FieldMapping[];
  sampleData: Record<string, any>[];
  systemFields: Array<{ value: string; label: string }>;
}

export const FieldMappingPreview: React.FC<FieldMappingPreviewProps> = ({
  mappings,
  sampleData,
  systemFields,
}) => {
  const getSystemFieldLabel = (mapping: FieldMapping) => {
    if (mapping.isCustomField && mapping.customFieldName) {
      return mapping.customFieldName;
    }
    
    const field = systemFields.find(f => f.value === mapping.systemField);
    return field ? field.label : mapping.systemField;
  };

  const generatePreviewData = () => {
    return sampleData.slice(0, 3).map((row, index) => {
      const mappedRow: Record<string, string> = {};
      
      mappings.forEach((mapping) => {
        if (mapping.systemField && mapping.mappedColumns.length > 0) {
          const values = mapping.mappedColumns
            .map(col => row[col] || '')
            .filter(val => val !== '');
          
          mappedRow[mapping.systemField] = values.join(' ').trim() || '-';
        }
      });

      return {
        originalRowIndex: index + 1,
        ...mappedRow,
      };
    });
  };

  const previewData = generatePreviewData();

  if (mappings.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          תצוגה מקדימה של הנתונים הממופים
          <Badge variant="outline">
            {previewData.length} שורות לדוגמה
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                {mappings.map((mapping) => (
                  <TableHead key={mapping.id}>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {getSystemFieldLabel(mapping)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {mapping.mappedColumns.join(' + ')}
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
            <TableBody>
              {previewData.map((row) => (
                <TableRow key={row.originalRowIndex}>
                  <TableCell className="font-mono text-sm">
                    {row.originalRowIndex}
                  </TableCell>
                  {mappings.map((mapping) => (
                    <TableCell key={mapping.id} className="max-w-48">
                      <div className="truncate" title={row[mapping.systemField]}>
                        {row[mapping.systemField] || '-'}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {sampleData.length > 3 && (
          <div className="text-sm text-gray-500 mt-4 text-center">
            מציג 3 שורות מתוך {sampleData.length} שורות במקובץ
          </div>
        )}
      </CardContent>
    </Card>
  );
};
