
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';

interface DataPreviewTableProps {
  fileColumns: string[];
  sampleData: any[];
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  fileColumns,
  sampleData,
}) => {
  const isMobile = useIsMobile();

  if (sampleData.length === 0) {
    return null;
  }

  // Handle both array and object data structures
  const getRowValue = (row: any, columnIndex: number, columnName: string) => {
    if (Array.isArray(row)) {
      return row[columnIndex] || '-';
    } else {
      return row[columnName] || '-';
    }
  };

  // Get effective column headers - either from fileColumns or generate indices
  const effectiveColumns = fileColumns.length > 0 
    ? fileColumns 
    : sampleData[0] && Array.isArray(sampleData[0]) 
      ? sampleData[0].map((_: any, index: number) => `עמודה ${index + 1}`)
      : Object.keys(sampleData[0] || {});

  // Filter out empty or irrelevant columns for better display
  const relevantColumns = effectiveColumns.filter((column, index) => {
    // Check if column has meaningful data in sample rows
    const hasData = sampleData.some(row => {
      const value = getRowValue(row, index, column);
      return value && 
        value.toString().trim() !== '' && 
        value.toString().trim() !== '-' &&
        value !== null &&
        value !== undefined;
    });
    return hasData;
  });

  // Limit the number of columns displayed based on screen size
  const maxColumns = isMobile ? 4 : 8;
  const displayColumns = relevantColumns.slice(0, maxColumns);
  const hasMoreColumns = relevantColumns.length > maxColumns;

  // Limit rows for preview
  const maxRows = isMobile ? 3 : 5;
  const displayRows = sampleData.slice(0, maxRows);

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
          תצוגה מקדימה של הנתונים ({sampleData.length} שורות)
        </CardTitle>
        {hasMoreColumns && (
          <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            מציג {displayColumns.length} מתוך {relevantColumns.length} עמודות עם נתונים
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  {displayColumns.map((column, index) => (
                    <TableHead 
                      key={`${column}-${index}`}
                      className={`${
                        isMobile 
                          ? 'min-w-[100px] max-w-[120px] text-xs p-2' 
                          : 'min-w-[120px] max-w-[180px] text-sm p-3'
                      } truncate`}
                      title={column}
                    >
                      <div className="truncate">
                        {column}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        עמודה {fileColumns.indexOf(column) >= 0 ? fileColumns.indexOf(column) + 1 : index + 1}
                      </div>
                    </TableHead>
                  ))}
                  {hasMoreColumns && (
                    <TableHead className={`${isMobile ? 'text-xs p-2' : 'text-sm p-3'} text-center`}>
                      ...
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="text-center font-mono text-xs">
                      {rowIndex + 1}
                    </TableCell>
                    {displayColumns.map((column, columnIndex) => {
                      const originalColumnIndex = fileColumns.indexOf(column);
                      const value = getRowValue(row, originalColumnIndex >= 0 ? originalColumnIndex : columnIndex, column);
                      return (
                        <TableCell 
                          key={`${column}-${columnIndex}`}
                          className={`${
                            isMobile 
                              ? 'max-w-[120px] text-xs p-2' 
                              : 'max-w-[180px] text-sm p-3'
                          } truncate`}
                          title={value?.toString() || '-'}
                        >
                          <div className="truncate">
                            {value?.toString() || '-'}
                          </div>
                        </TableCell>
                      );
                    })}
                    {hasMoreColumns && (
                      <TableCell className={`${isMobile ? 'text-xs p-2' : 'text-sm p-3'} text-center text-gray-400`}>
                        ...
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Summary information */}
        <div className={`mt-4 space-y-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
          <div className="flex justify-between">
            <span>שורות לדוגמה:</span>
            <span>{displayRows.length} מתוך {sampleData.length}</span>
          </div>
          <div className="flex justify-between">
            <span>עמודות מוצגות:</span>
            <span>{displayColumns.length} מתוך {effectiveColumns.length}</span>
          </div>
          {relevantColumns.length < effectiveColumns.length && (
            <p className="text-yellow-600 text-xs">
              הוסתרו {effectiveColumns.length - relevantColumns.length} עמודות ריקות
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
