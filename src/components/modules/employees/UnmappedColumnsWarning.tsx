
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UnmappedColumnsWarningProps {
  unmappedColumns: string[];
}

export const UnmappedColumnsWarning: React.FC<UnmappedColumnsWarningProps> = ({
  unmappedColumns,
}) => {
  if (unmappedColumns.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">עמודות לא ממופות</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-orange-700 mb-2">
          העמודות הבאות לא ממופות לשדה במערכת ולא יובאו:
        </p>
        <div className="flex flex-wrap gap-2">
          {unmappedColumns.map((column) => (
            <Badge key={column} variant="outline" className="text-orange-700">
              {column}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
