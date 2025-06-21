
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>תצוגה מקדימה של הנתונים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {fileColumns.slice(0, isMobile ? 3 : fileColumns.length).map((column) => (
                  <TableHead key={column} className={`${isMobile ? 'min-w-[80px] text-xs' : 'min-w-[120px]'}`}>
                    {column}
                  </TableHead>
                ))}
                {isMobile && fileColumns.length > 3 && (
                  <TableHead className="min-w-[60px] text-xs">...</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.slice(0, isMobile ? 2 : 3).map((row, index) => (
                <TableRow key={index}>
                  {fileColumns.slice(0, isMobile ? 3 : fileColumns.length).map((column) => (
                    <TableCell key={column} className={`${isMobile ? 'max-w-[80px] text-xs' : 'max-w-[200px]'} truncate`}>
                      {row[column] || '-'}
                    </TableCell>
                  ))}
                  {isMobile && fileColumns.length > 3 && (
                    <TableCell className="text-xs">...</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
