import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface ActivityLogProps {
  businessId: string;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ businessId }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">לוג פעילות</h2>
        <p className="text-gray-600">מעקב כל הפעולות במערכת לפי תקנות רשות המיסים</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            פעילות אחרונה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">בקרוב</h3>
            <p className="text-gray-600">מודול לוג הפעילות יהיה זמין בקרוב</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};