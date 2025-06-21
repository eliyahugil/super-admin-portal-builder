
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';
import { CategorySelectWithAdd } from '@/components/shared/CategorySelectWithAdd';
import { FieldMapping } from '@/hooks/useEmployeeImport/types';
import { cn } from '@/lib/utils';

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

  const getSystemFieldLabel = (mapping: FieldMapping) => {
    if (mapping.isCustomField && mapping.customFieldName) {
      return mapping.customFieldName;
    }
    
    const field = systemFields.find(f => f.value === mapping.systemField);
    return field ? field.label : mapping.systemField;
  };

  const generatePreviewData = () => {
    // Take first 5 rows for preview
    const dataToProcess = sampleData.slice(0, 5);
    
    console.log('📊 generatePreviewData - Processing data:', {
      totalRows: dataToProcess.length,
      mappingsCount: mappings.length,
      firstRowSample: dataToProcess[0] ? {
        isArray: Array.isArray(dataToProcess[0]),
        keys: Array.isArray(dataToProcess[0]) ? 
          `Array length: ${dataToProcess[0].length}` : 
          Object.keys(dataToProcess[0]).slice(0, 5)
      } : 'No data'
    });
    
    return dataToProcess.map((row, rowIndex) => {
      console.log(`📋 Processing row ${rowIndex + 1}:`, {
        rowData: Array.isArray(row) ? row.slice(0, 3) : Object.entries(row || {}).slice(0, 3)
      });

      const mappedRow: Record<string, any> = {};
      
      mappings.forEach((mapping) => {
        if (mapping.systemField && mapping.mappedColumns && mapping.mappedColumns.length > 0) {
          const values: string[] = [];
          
          mapping.mappedColumns.forEach(columnName => {
            let fieldValue;
            
            if (Array.isArray(row)) {
              // For array data, convert column name to index
              const columnIndex = parseInt(columnName.replace(/\D/g, ''), 10) - 1;
              if (!isNaN(columnIndex) && columnIndex >= 0 && columnIndex < row.length) {
                fieldValue = row[columnIndex];
                console.log(`  Array access: Column "${columnName}" -> Index ${columnIndex} -> Value: "${fieldValue}"`);
              } else {
                console.log(`  Array access failed: Column "${columnName}" -> Index ${columnIndex} (out of bounds)`);
              }
            } else if (typeof row === 'object' && row !== null) {
              // For object data, direct property access
              fieldValue = row[columnName];
              console.log(`  Object access: "${columnName}" -> "${fieldValue}"`);
            }
            
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
              const cleanValue = String(fieldValue).trim();
              if (cleanValue) {
                values.push(cleanValue);
              }
            }
          });
          
          const combinedValue = values.length > 1 ? values.join(' ') : (values[0] || '');
          console.log(`🗺️ Final mapping: ${mapping.systemField} <- [${mapping.mappedColumns.join(', ')}] = "${combinedValue}"`);
          
          mappedRow[mapping.systemField] = {
            value: combinedValue || '-',
            originalValue: combinedValue || '-',
            isMapped: true,
            isEmpty: !combinedValue,
            mappedColumns: mapping.mappedColumns
          };
        }
      });

      console.log(`✅ Row ${rowIndex + 1} mapped result:`, {
        fieldsCount: Object.keys(mappedRow).length,
        fields: Object.keys(mappedRow).map(key => `${key}: "${mappedRow[key]?.value}"`).slice(0, 3)
      });

      return {
        originalRowIndex: rowIndex + 1,
        ...mappedRow,
      };
    });
  };

  const previewData = generatePreviewData();

  console.log('📋 Final preview data generated:', {
    previewRowsCount: previewData.length,
    samplePreviewRow: previewData[0] ? {
      totalFields: Object.keys(previewData[0]).length,
      mappedFields: Object.keys(previewData[0]).filter(key => key !== 'originalRowIndex'),
      sampleValues: Object.entries(previewData[0])
        .filter(([key]) => key !== 'originalRowIndex')
        .slice(0, 3)
        .map(([key, value]) => `${key}: ${typeof value === 'object' ? value.value : value}`)
    } : 'No preview data'
  });

  const getCellClassName = (cellData: any) => {
    if (!cellData || typeof cellData !== 'object') return '';
    
    return cn(
      'relative',
      cellData.isMapped && cellData.isEmpty && 'bg-yellow-100 border-yellow-200',
      !cellData.isMapped && cellData.value !== '-' && 'bg-red-100 border-red-200',
      cellData.isMapped && !cellData.isEmpty && 'bg-green-50 border-green-200'
    );
  };

  const renderEditableCell = (mapping: FieldMapping, rowIndex: number, cellData: any) => {
    const cellKey = `${mapping.systemField}-${rowIndex}`;
    const isEditing = editingCell === cellKey;
    
    // Check if this field should have a dropdown
    const isSelectField = ['employee_type', 'main_branch_id'].includes(mapping.systemField);
    
    if (isEditing && isSelectField) {
      const categoryType = mapping.systemField === 'employee_type' ? 'employee_type' : 'branch';
      
      return (
        <div className="flex items-center gap-2 min-w-[180px]">
          <CategorySelectWithAdd
            typeCategory={categoryType as any}
            value={editValues[cellKey] || cellData?.value || ''}
            onChange={(val) => setEditValues(prev => ({ ...prev, [cellKey]: val }))}
            businessId={businessId}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              // Save the changes here
              setEditingCell(null);
            }}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingCell(null);
              setEditValues(prev => {
                const updated = { ...prev };
                delete updated[cellKey];
                return updated;
              });
            }}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-between group">
        <div className="truncate flex-1" title={cellData?.value || '-'}>
          {cellData?.value || '-'}
        </div>
        {isSelectField && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingCell(cellKey)}
            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  if (mappings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <p className="mb-2">אין מיפויים זמינים</p>
            <p className="text-sm">עליך להוסיף מיפויי שדות כדי לראות תצוגה מקדימה</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            תצוגה מקדימה של הנתונים הממופים
            <Badge variant="outline">
              {previewData.length} שורות לדוגמה
            </Badge>
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span>ממופה, ערכים ריקים</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>לא ממופה, יש ערכים</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
              <span>ממופה תקין</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="h-full overflow-auto p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  {mappings.map((mapping) => (
                    <TableHead key={mapping.id} className="min-w-[150px]">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {getSystemFieldLabel(mapping)}
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
              <TableBody>
                {previewData.map((row, rowIndex) => (
                  <TableRow key={row.originalRowIndex}>
                    <TableCell className="font-mono text-sm">
                      {row.originalRowIndex}
                    </TableCell>
                    {mappings.map((mapping) => (
                      <TableCell 
                        key={mapping.id} 
                        className={cn('max-w-48 p-2', getCellClassName(row[mapping.systemField]))}
                      >
                        {renderEditableCell(mapping, rowIndex, row[mapping.systemField])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {sampleData.length > 5 && (
              <div className="text-sm text-gray-500 mt-4 text-center">
                מציג 5 שורות מתוך {sampleData.length} שורות במקובץ
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
