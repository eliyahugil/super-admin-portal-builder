
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, AlertTriangle } from 'lucide-react';

interface ImportStatisticsGridProps {
  totalProcessed: number;
  importedCount: number;
  errorCount: number;
  duplicateCount: number;
}

export const ImportStatisticsGrid: React.FC<ImportStatisticsGridProps> = ({
  totalProcessed,
  importedCount,
  errorCount,
  duplicateCount,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <div className="text-2xl font-bold text-blue-600">{totalProcessed}</div>
          </div>
          <div className="text-sm text-muted-foreground">סה״כ נעבד</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <UserCheck className="h-5 w-5 text-green-600 mr-2" />
            <div className="text-2xl font-bold text-green-600">{importedCount}</div>
          </div>
          <div className="text-sm text-muted-foreground">יובאו בהצלחה</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <UserX className="h-5 w-5 text-red-600 mr-2" />
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          </div>
          <div className="text-sm text-muted-foreground">שגיאות</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <div className="text-2xl font-bold text-yellow-600">{duplicateCount}</div>
          </div>
          <div className="text-sm text-muted-foreground">כפילויות</div>
        </CardContent>
      </Card>
    </div>
  );
};
