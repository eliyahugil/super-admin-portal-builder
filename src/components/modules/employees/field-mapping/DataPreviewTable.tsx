
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface DataPreviewTableProps {
  fileColumns: string[];
  sampleData: any[];
  mappings: Array<{ systemField: string; mappedColumns: string[] }>;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  fileColumns,
  sampleData,
  mappings = []
}) => {
  console.log('📋 DataPreviewTable - Received data:', {
    fileColumnsCount: fileColumns.length,
    sampleDataCount: sampleData.length,
    sampleColumns: fileColumns.slice(0, 5),
    firstRowType: sampleData[0] ? (Array.isArray(sampleData[0]) ? 'array' : 'object') : 'no data',
    firstRowSample: sampleData[0] ? (Array.isArray(sampleData[0]) ? sampleData[0].slice(0, 3) : 'not array') : 'no data'
  });

  // Check if column is mapped to any system field
  const isColumnMapped = (columnName: string) => {
    return mappings.some(mapping => 
      mapping.mappedColumns && mapping.mappedColumns.includes(columnName)
    );
  };

  // Get system field name for mapped column
  const getSystemFieldForColumn = (columnName: string) => {
    const mapping = mappings.find(m => 
      m.mappedColumns && m.mappedColumns.includes(columnName)
    );
    return mapping?.systemField;
  };

  const previewData = sampleData.slice(0, 10); // Show first 10 rows

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          נתוני הקובץ הגולמיים
          <Badge variant="outline">
            {fileColumns.length} עמודות, {sampleData.length} שורות
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          זוהי תצוגה של הנתונים כפי שהם נקראו מהקובץ
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                {fileColumns.map((column, index) => {
                  const isMapped = isColumnMapped(column);
                  const systemField = getSystemFieldForColumn(column);
                  
                  return (
                    <TableHead key={index} className="min-w-[120px]">
                      <div className="space-y-1">
                        <div className={`font-medium ${isMapped ? 'text-green-700' : 'text-gray-700'}`}>
                          {column}
                        </div>
                        {isMapped && systemField && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            → {systemField}
                          </Badge>
                        )}
                        {!isMapped && (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            לא ממופה
                          </Badge>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="font-mono text-sm text-gray-500">
                    {rowIndex + 1}
                  </TableCell>
                  {fileColumns.map((_, colIndex) => {
                    let cellValue = '';
                    
                    if (Array.isArray(row)) {
                      cellValue = row[colIndex] !== null && row[colIndex] !== undefined 
                        ? String(row[colIndex]) 
                        : '';
                    }
                    
                    const isEmpty = !cellValue || cellValue.trim() === '';
                    const isMapped = isColumnMapped(fileColumns[colIndex]);
                    
                    return (
                      <TableCell 
                        key={colIndex} 
                        className={`max-w-[200px] truncate ${
                          isEmpty ? 'bg-gray-50 text-gray-400' : 
                          isMapped ? 'bg-green-50 border-l-2 border-green-200' : ''
                        }`}
                        title={cellValue || 'ריק'}
                      >
                        {cellValue || '-'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {sampleData.length > 10 && (
            <div className="text-sm text-gray-500 mt-4 text-center">
              מציג 10 שורות מתוך {sampleData.length} שורות במקובץ
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
