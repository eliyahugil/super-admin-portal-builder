
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FieldMapping } from '@/hooks/useEmployeeImport/types';
import { generatePreviewData } from './field-mapping/PreviewDataGenerator';
import { PreviewLegend } from './field-mapping/PreviewLegend';
import { PreviewTableHeader } from './field-mapping/PreviewTableHeader';
import { PreviewTableRow } from './field-mapping/PreviewTableRow';

interface FieldMappingPreviewProps {
  mappings: FieldMapping[];
  sampleData: Record<string, any>[];
  systemFields: Array<{ value: string; label: string }>;
  businessId?: string;
}

export const FieldMappingPreview: React.FC<FieldMappingPreviewProps> = ({
  mappings,
  sampleData,
  systemFields,
  businessId,
}) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  console.log('🔍 FieldMappingPreview - data received:', {
    mappingsCount: mappings.length,
    sampleDataCount: sampleData.length,
    sampleMappings: mappings.slice(0, 2).map(m => ({
      systemField: m.systemField,
      mappedColumns: m.mappedColumns,
      label: m.label
    })),
    sampleDataStructure: sampleData[0] ? {
      type: Array.isArray(sampleData[0]) ? 'array' : 'object',
      keys: Array.isArray(sampleData[0]) ? 'Array items' : Object.keys(sampleData[0]).slice(0, 5)
    } : 'No data'
  });

  const previewData = generatePreviewData(mappings, sampleData);

  console.log('📋 Final preview data generated:', {
    previewRowsCount: previewData.length,
    samplePreviewRow: previewData[0] ? {
      totalFields: Object.keys(previewData[0]).length,
      mappedFields: Object.keys(previewData[0]).filter(key => key !== 'originalRowIndex'),
      sampleValues: Object.entries(previewData[0])
        .filter(([key]) => key !== 'originalRowIndex')
        .slice(0, 3)
        .map(([key, value]) => {
          if (typeof value === 'object' && value && 'value' in value) {
            return `${key}: ${value.value}`;
          }
          return `${key}: ${value}`;
        })
    } : 'No preview data'
  });

  const handleEditStart = (cellKey: string) => {
    setEditingCell(cellKey);
  };

  const handleEditSave = (cellKey: string) => {
    setEditingCell(null);
  };

  const handleEditCancel = (cellKey: string) => {
    setEditingCell(null);
    setEditValues(prev => {
      const updated = { ...prev };
      delete updated[cellKey];
      return updated;
    });
  };

  const handleEditValueChange = (cellKey: string, value: string) => {
    setEditValues(prev => ({ ...prev, [cellKey]: value }));
  };

  if (mappings.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full py-12">
          <div className="text-center text-gray-500">
            <p className="mb-2">אין מיפויים זמינים</p>
            <p className="text-sm">עליך להוסיף מיפויי שדות כדי לראות תצוגה מקדימה</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          תצוגה מקדימה של הנתונים הממופים
          <Badge variant="outline">
            {previewData.length} שורות לדוגמה
          </Badge>
        </CardTitle>
        <PreviewLegend />
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="p-6">
            <div className="min-w-full overflow-x-auto">
              <Table>
                <PreviewTableHeader 
                  mappings={mappings} 
                  systemFields={systemFields} 
                />
                <TableBody>
                  {previewData.map((row, rowIndex) => (
                    <PreviewTableRow
                      key={row.originalRowIndex}
                      row={row}
                      rowIndex={rowIndex}
                      mappings={mappings}
                      businessId={businessId}
                      editingCell={editingCell}
                      editValues={editValues}
                      onEditStart={handleEditStart}
                      onEditSave={handleEditSave}
                      onEditCancel={handleEditCancel}
                      onEditValueChange={handleEditValueChange}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {sampleData.length > 5 && (
              <div className="text-sm text-gray-500 mt-4 text-center">
                מציג 5 שורות מתוך {sampleData.length} שורות במקובץ
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
