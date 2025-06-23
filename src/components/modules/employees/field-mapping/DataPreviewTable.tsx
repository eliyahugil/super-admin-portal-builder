
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface SimpleMapping {
  systemField: string;
  mappedColumns: string[];
}

interface DataPreviewTableProps {
  fileColumns: string[];
  sampleData: any[];
  mappings: SimpleMapping[];
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  fileColumns,
  sampleData,
  mappings,
}) => {
  const isMobile = useIsMobile();
  
  console.log('📊 DataPreviewTable rendered with:', {
    fileColumns: fileColumns.length,
    sampleData: sampleData.length,
    mappings: mappings.length,
    isMobile,
    sampleDataStructure: sampleData[0] ? {
      isArray: Array.isArray(sampleData[0]),
      keys: Array.isArray(sampleData[0]) ? 'array' : Object.keys(sampleData[0] || {}).slice(0, 5)
    } : 'no data'
  });

  const getMappedSystemField = (columnName: string) => {
    const mapping = mappings.find(m => m.mappedColumns.includes(columnName));
    return mapping?.systemField;
  };

  const getDisplayValue = (row: any, columnIndex: number, columnName: string) => {
    if (Array.isArray(row)) {
      return row[columnIndex] !== null && row[columnIndex] !== undefined ? 
        String(row[columnIndex]).trim() : '';
    } else if (row && typeof row === 'object') {
      return row[columnName] !== null && row[columnName] !== undefined ? 
        String(row[columnName]).trim() : '';
    }
    return '';
  };

  if (fileColumns.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-gray-500">אין נתונים להצגה</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>
          תצוגה מקדימה של נתוני הקובץ
        </CardTitle>
        <CardDescription className={isMobile ? 'text-xs' : 'text-sm'}>
          מציג את {Math.min(sampleData.length, 5)} השורות הראשונות מהקובץ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`w-full ${isMobile ? 'h-80' : 'h-96'}`}>
          <div className={`min-w-full ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  {fileColumns.map((column, index) => {
                    const mappedField = getMappedSystemField(column);
                    return (
                      <TableHead key={index} className={`${isMobile ? 'p-2 text-xs' : 'p-3'} min-w-32`}>
                        <div className="space-y-1">
                          <div className="font-medium truncate" title={column}>
                            {column}
                          </div>
                          {mappedField && (
                            <Badge variant="secondary" className={`${isMobile ? 'text-xs px-1 py-0' : 'text-xs'}`}>
                              {mappedField}
                            </Badge>
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.slice(0, 5).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {fileColumns.map((column, colIndex) => {
                      const value = getDisplayValue(row, colIndex, column);
                      return (
                        <TableCell 
                          key={colIndex} 
                          className={`${isMobile ? 'p-2 text-xs' : 'p-3'} max-w-48`}
                        >
                          <div className="truncate" title={value}>
                            {value || <span className="text-gray-400">ריק</span>}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        
        {sampleData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            אין נתונים להצגה בקובץ
          </div>
        )}
      </CardContent>
    </Card>
  );
};
