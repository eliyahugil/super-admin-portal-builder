
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

  // Filter out empty or irrelevant columns for better display
  const relevantColumns = fileColumns.filter(column => {
    // Check if column has meaningful data in sample rows
    const hasData = sampleData.some(row => 
      row[column] && 
      row[column].toString().trim() !== '' && 
      row[column].toString().trim() !== '-'
    );
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
          תצוגה מקדימה של הנתונים
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
                  {displayColumns.map((column) => (
                    <TableHead 
                      key={column} 
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
                {displayRows.map((row, index) => (
                  <TableRow key={index}>
                    {displayColumns.map((column) => (
                      <TableCell 
                        key={column} 
                        className={`${
                          isMobile 
                            ? 'max-w-[120px] text-xs p-2' 
                            : 'max-w-[180px] text-sm p-3'
                        } truncate`}
                        title={row[column] || '-'}
                      >
                        <div className="truncate">
                          {row[column] || '-'}
                        </div>
                      </TableCell>
                    ))}
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
            <span>{displayColumns.length} מתוך {fileColumns.length}</span>
          </div>
          {relevantColumns.length < fileColumns.length && (
            <p className="text-yellow-600 text-xs">
              הוסתרו {fileColumns.length - relevantColumns.length} עמודות ריקות
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
