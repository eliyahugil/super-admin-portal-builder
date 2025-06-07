
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ValidationSummary {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
}

interface ValidationSummaryStatsProps {
  summary: ValidationSummary;
}

export const ValidationSummaryStats: React.FC<ValidationSummaryStatsProps> = ({
  summary,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.totalRows}</div>
          <div className="text-sm text-muted-foreground">סה״כ שורות</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{summary.validRows}</div>
          <div className="text-sm text-muted-foreground">תקינות</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{summary.warningRows}</div>
          <div className="text-sm text-muted-foreground">אזהרות</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{summary.errorRows}</div>
          <div className="text-sm text-muted-foreground">שגיאות</div>
        </CardContent>
      </Card>
    </div>
  );
};
