
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataSummary } from './types';

interface SyncStatusProps {
  dataSummary: DataSummary;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ dataSummary }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">סטטוס סנכרון</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Calendar</span>
            <Badge className="bg-green-100 text-green-800">פעיל</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Gmail</span>
            <Badge className="bg-yellow-100 text-yellow-800">ממתין</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Drive</span>
            <Badge className="bg-yellow-100 text-yellow-800">ממתין</Badge>
          </div>
          <div className="text-xs text-gray-500 mt-4">
            סנכרון אחרון: {dataSummary.lastSyncTime}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
