
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface ReminderStatsProps {
  totalEmployees: number;
  unsubmittedCount: number;
}

export const ReminderStats: React.FC<ReminderStatsProps> = ({
  totalEmployees,
  unsubmittedCount
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          סיכום הגשות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">סך הכל עובדים פעילים:</span>
          <Badge variant="secondary">{totalEmployees}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">הגישו השבוע:</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {totalEmployees - unsubmittedCount}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">לא הגישו:</span>
          <Badge variant="destructive">{unsubmittedCount}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
